import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from '../attendance/schemas/attendance-record.schema';
import {
  AttendanceStatus,
  StatusFlag,
} from '../attendance/enums/attendance-status.enum';
import {
  ClassSession,
  ClassSessionDocument,
} from '../class-session/schemas/class-session.schema';
import {
  AbsenceSubmission,
  AbsenceSubmissionDocument,
} from './schemas/absence-submission.schema';
import {
  SubmissionStatus,
  TERMINAL_SUBMISSION_STATUSES,
} from './enums/submission-status.enum';
import { SubmissionType } from './enums/submission-type.enum';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  AuditAction,
  AuditEntity,
} from '../audit-log/enums/audit-action.enum';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(AbsenceSubmission.name)
    private readonly submissionModel: Model<AbsenceSubmissionDocument>,
    @InjectModel(ClassSession.name)
    private readonly sessionModel: Model<ClassSessionDocument>,
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    private readonly userScope: UserScopeService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(
    dto: CreateSubmissionDto,
    actor: AuthUserPayload,
  ): Promise<AbsenceSubmissionDocument> {
    if (!this.userScope.isInstructor(actor)) {
      throw new ForbiddenException(
        'Only instructors can create absence submissions',
      );
    }

    const session = await this.sessionModel.findById(dto.sessionId).lean();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (String(session.lecturerId) !== actor.id) {
      throw new ForbiddenException(
        'You are not the assigned instructor for this session',
      );
    }

    try {
      const created = await this.submissionModel.create({
        instructorUserId: new Types.ObjectId(actor.id),
        sessionId: new Types.ObjectId(dto.sessionId),
        facultyId: session.facultyId,
        type: dto.type,
        reason: dto.reason,
        description: dto.description,
        status: SubmissionStatus.PENDING,
        decisionHistory: [
          {
            status: SubmissionStatus.PENDING,
            actorId: new Types.ObjectId(actor.id),
            at: new Date(),
          },
        ],
      });
      await this.auditLog.record({
        actor,
        action: AuditAction.CREATE,
        entityType: AuditEntity.ABSENCE_SUBMISSION,
        entityId: created._id,
        facultyId: created.facultyId,
        after: { type: dto.type, reason: dto.reason },
      });
      return created;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException(
          'You have already submitted this kind of request for this session',
        );
      }
      throw err;
    }
  }

  async findAllPaginated(
    q: TableQueryDto,
    actor: AuthUserPayload,
  ): Promise<PaginatedResult<AbsenceSubmissionDocument>> {
    const baseMatch = await this.buildScopeMatch(actor);
    return paginateFind<AbsenceSubmissionDocument>(this.submissionModel, q, {
      searchFields: ['reason', 'description', 'status', 'type'],
      defaultSort: { createdAt: -1 },
      populate: [
        {
          path: 'instructorUserId',
          select: 'username firstName lastName email',
        },
        {
          path: 'sessionId',
          populate: [
            { path: 'classId', select: 'name' },
            { path: 'courseId', select: 'name' },
          ],
        },
        { path: 'reviewerId', select: 'username firstName lastName' },
      ],
      baseMatch:
        Object.keys(baseMatch).length > 0 ? baseMatch : undefined,
    });
  }

  async findById(
    id: string,
    actor: AuthUserPayload,
  ): Promise<AbsenceSubmissionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Submission not found');
    }
    const baseMatch = await this.buildScopeMatch(actor);
    const filter: Record<string, unknown> = { _id: new Types.ObjectId(id) };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const doc = await this.submissionModel
      .findOne(filter as never)
      .populate([
        {
          path: 'instructorUserId',
          select: 'username firstName lastName email',
        },
        {
          path: 'sessionId',
          populate: [
            { path: 'classId', select: 'name' },
            { path: 'courseId', select: 'name' },
          ],
        },
        { path: 'reviewerId', select: 'username firstName lastName' },
      ])
      .exec();
    if (!doc) {
      throw new NotFoundException('Submission not found');
    }
    return doc;
  }

  async approve(
    id: string,
    dto: ReviewSubmissionDto,
    actor: AuthUserPayload,
  ): Promise<AbsenceSubmissionDocument> {
    this.assertReviewer(actor);
    const submission = await this.findReviewable(id, actor);
    return this.transition(
      submission,
      SubmissionStatus.APPROVED,
      actor,
      dto.note,
    );
  }

  async reject(
    id: string,
    dto: ReviewSubmissionDto,
    actor: AuthUserPayload,
  ): Promise<AbsenceSubmissionDocument> {
    this.assertReviewer(actor);
    const submission = await this.findReviewable(id, actor);
    return this.transition(
      submission,
      SubmissionStatus.REJECTED,
      actor,
      dto.note,
    );
  }

  private assertReviewer(actor: AuthUserPayload): void {
    if (
      !this.userScope.isSuperAdmin(actor) &&
      !this.userScope.isFacultyAdmin(actor)
    ) {
      throw new ForbiddenException('Only admins can review submissions');
    }
  }

  private async findReviewable(
    id: string,
    actor: AuthUserPayload,
  ): Promise<AbsenceSubmissionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Submission not found');
    }
    const submission = await this.submissionModel.findById(id).exec();
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (
      this.userScope.isFacultyAdmin(actor) &&
      String(submission.facultyId) !== String(actor.facultyId)
    ) {
      throw new ForbiddenException(
        'You can only review submissions for your own faculty',
      );
    }
    if (TERMINAL_SUBMISSION_STATUSES.includes(submission.status)) {
      throw new BadRequestException(
        `Submission is already ${submission.status.toLowerCase()}`,
      );
    }
    return submission;
  }

  private async transition(
    submission: AbsenceSubmissionDocument,
    next: SubmissionStatus,
    actor: AuthUserPayload,
    note?: string,
  ): Promise<AbsenceSubmissionDocument> {
    const now = new Date();
    submission.status = next;
    submission.reviewerId = new Types.ObjectId(actor.id);
    submission.reviewedAt = now;
    submission.reviewNote = note;
    submission.decisionHistory.push({
      status: next,
      actorId: new Types.ObjectId(actor.id),
      at: now,
      note,
    });
    if (next === SubmissionStatus.APPROVED) {
      await this.applyApprovalSideEffects(submission);
    }
    const saved = await submission.save();
    await this.auditLog.record({
      actor,
      action:
        next === SubmissionStatus.APPROVED
          ? AuditAction.SUBMISSION_APPROVE
          : AuditAction.SUBMISSION_REJECT,
      entityType: AuditEntity.ABSENCE_SUBMISSION,
      entityId: saved._id,
      facultyId: saved.facultyId,
      after: { status: saved.status, note },
    });
    return saved;
  }

  /**
   * Approval side effects on the related attendance record:
   *  - ABSENCE      → upsert attendance record with status=EXCUSED
   *  - LATE_ARRIVAL → push LATE_EXCUSED flag (recorded status untouched)
   *  - EARLY_LEAVE  → push EARLY_EXCUSED flag
   */
  private async applyApprovalSideEffects(
    submission: AbsenceSubmissionDocument,
  ): Promise<void> {
    if (submission.type === SubmissionType.ABSENCE) {
      const session = await this.sessionModel.findById(submission.sessionId);
      if (!session) return;
      await this.attendanceModel.findOneAndUpdate(
        {
          sessionId: submission.sessionId,
          instructorUserId: submission.instructorUserId,
        },
        {
          $setOnInsert: {
            sessionId: submission.sessionId,
            instructorUserId: submission.instructorUserId,
            facultyId: session.facultyId,
            campusId: session.campusId,
            hallId: session.hallId,
            scheduledDate: session.scheduledDate,
            scheduledStart: session.fromTime,
            scheduledEnd: session.toTime,
          },
          $set: { status: AttendanceStatus.EXCUSED },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      return;
    }

    const flag =
      submission.type === SubmissionType.LATE_ARRIVAL
        ? StatusFlag.LATE_EXCUSED
        : StatusFlag.EARLY_EXCUSED;

    await this.attendanceModel.updateOne(
      {
        sessionId: submission.sessionId,
        instructorUserId: submission.instructorUserId,
      },
      { $addToSet: { statusFlags: flag } },
    );
  }

  private async buildScopeMatch(
    actor: AuthUserPayload,
  ): Promise<Record<string, unknown>> {
    if (this.userScope.isSuperAdmin(actor)) return {};
    if (this.userScope.isFacultyAdmin(actor)) {
      if (!actor.facultyId) {
        return { _id: { $exists: false } };
      }
      return { facultyId: new Types.ObjectId(actor.facultyId) };
    }
    if (this.userScope.isInstructor(actor)) {
      return { instructorUserId: new Types.ObjectId(actor.id) };
    }
    return { _id: { $exists: false } };
  }
}
