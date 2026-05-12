import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from './schemas/attendance-record.schema';
import { AttendanceValidationService } from './attendance-validation.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdminCheckOutDto } from './dto/admin-check-out.dto';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { paginateFind } from '../../common/utils/mongo-table-query';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  AuditAction,
  AuditEntity,
} from '../audit-log/enums/audit-action.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    private readonly validationService: AttendanceValidationService,
    private readonly auditLog: AuditLogService,
  ) {}

  async checkIn(dto: CheckInDto, user: AuthUserPayload) {
    const recordData = await this.validationService.validateCheckIn(
      dto,
      user.id,
    );
    try {
      const created = await this.attendanceModel.create(recordData);
      await this.auditLog.record({
        actor: user,
        action: AuditAction.CHECK_IN,
        entityType: AuditEntity.ATTENDANCE_RECORD,
        entityId: created._id,
        facultyId: created.facultyId,
        after: { status: created.status, statusFlags: created.statusFlags },
      });
      return created;
    } catch (err: unknown) {
      /**
       * The unique `(sessionId, instructorUserId)` index protects against the
       * tiny window between `findOne` and `create`. Surface the duplicate as a
       * friendly 409 instead of leaking the raw E11000.
       */
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException(
          'You have already checked in to this session',
        );
      }
      throw err;
    }
  }

  async checkOut(dto: CheckOutDto, user: AuthUserPayload) {
    const record = await this.validationService.validateCheckOut(dto, user.id);
    const saved = await record.save();
    await this.auditLog.record({
      actor: user,
      action: AuditAction.CHECK_OUT,
      entityType: AuditEntity.ATTENDANCE_RECORD,
      entityId: saved._id,
      facultyId: saved.facultyId,
      after: { status: saved.status, statusFlags: saved.statusFlags },
    });
    return saved;
  }

  async adminCheckOut(dto: AdminCheckOutDto, adminUser: AuthUserPayload) {
    const record = await this.validationService.validateAdminCheckOut(
      dto,
      adminUser.id,
    );
    const saved = await record.save();
    await this.auditLog.record({
      actor: adminUser,
      action: AuditAction.ADMIN_CHECK_OUT,
      entityType: AuditEntity.ATTENDANCE_RECORD,
      entityId: saved._id,
      facultyId: saved.facultyId,
      after: {
        status: saved.status,
        statusFlags: saved.statusFlags,
        instructorUserId: String(saved.instructorUserId),
        note: dto.note,
      },
    });
    return saved;
  }

  async findBySession(sessionId: string) {
    return this.attendanceModel
      .find({ sessionId })
      .populate('instructorUserId', 'username firstName lastName email')
      .populate('hallId', 'name code')
      .exec();
  }

  async findMyHistory(query: TableQueryDto, user: AuthUserPayload) {
    return paginateFind<AttendanceRecordDocument>(this.attendanceModel, query, {
      searchFields: ['status', 'scheduledStart', 'scheduledEnd'],
      defaultSort: { scheduledDate: -1 },
      populate: [
        {
          path: 'sessionId',
          populate: [
            { path: 'classId', select: 'name' },
            { path: 'courseId', select: 'name' },
          ],
        },
        { path: 'hallId', select: 'name code' },
      ],
      baseMatch: { instructorUserId: new Types.ObjectId(user.id) },
    });
  }

  /** State for a single session for the authenticated instructor — null if no record exists. */
  async findMySessionState(sessionId: string, user: AuthUserPayload) {
    if (!Types.ObjectId.isValid(sessionId)) {
      return null;
    }
    return this.attendanceModel
      .findOne({
        sessionId: new Types.ObjectId(sessionId),
        instructorUserId: new Types.ObjectId(user.id),
      })
      .populate('hallId', 'name code')
      .exec();
  }

  async findAllPaginated(
    query: TableQueryDto,
    userScopeFilters: Record<string, unknown>,
  ) {
    return paginateFind<AttendanceRecordDocument>(this.attendanceModel, query, {
      searchFields: ['status', 'scheduledStart', 'scheduledEnd'],
      defaultSort: { scheduledDate: -1 },
      populate: [
        { path: 'instructorUserId', select: 'username email' },
        { path: 'sessionId' },
        { path: 'hallId', select: 'name code' },
      ],
      baseMatch:
        userScopeFilters && Object.keys(userScopeFilters).length > 0
          ? userScopeFilters
          : undefined,
    });
  }
}
