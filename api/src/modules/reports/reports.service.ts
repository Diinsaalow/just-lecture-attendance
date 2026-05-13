import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UserScopeService } from '../../common/casl/user-scope.service';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from '../attendance/schemas/attendance-record.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from '../class-session/schemas/class-session.schema';
import {
  AbsenceSubmission,
  AbsenceSubmissionDocument,
} from '../submission/schemas/absence-submission.schema';
import { AttendanceStatus } from '../attendance/enums/attendance-status.enum';
import { SubmissionStatus } from '../submission/enums/submission-status.enum';

export interface ReportFilterQuery {
  from?: string;
  to?: string;
  facultyId?: string;
  departmentId?: string;
  classId?: string;
  instructorId?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    @InjectModel(ClassSession.name)
    private readonly sessionModel: Model<ClassSessionDocument>,
    @InjectModel(AbsenceSubmission.name)
    private readonly submissionModel: Model<AbsenceSubmissionDocument>,
    private readonly userScope: UserScopeService,
  ) {}

  /**
   * Dashboard summary card values: total sessions, present%, late%, absent%,
   * missed-checkouts, pending submissions — all within the requested filters.
   */
  async getDashboardSummary(
    actor: AuthUserPayload,
    filters: ReportFilterQuery,
  ) {
    const sessionMatch = await this.buildSessionMatch(actor, filters);
    const attendanceMatch = await this.buildAttendanceMatch(actor, filters);
    const submissionMatch = await this.buildSubmissionMatch(actor, filters);

    const [totalSessions, attendanceGroups, pendingSubmissions] =
      await Promise.all([
        this.sessionModel.countDocuments(sessionMatch),
        this.attendanceModel.aggregate<{ _id: AttendanceStatus; count: number }>([
          { $match: attendanceMatch },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        this.submissionModel.countDocuments({
          ...submissionMatch,
          status: SubmissionStatus.PENDING,
        }),
      ]);

    const statusCounts = Object.fromEntries(
      attendanceGroups.map((g) => [g._id, g.count]),
    ) as Partial<Record<AttendanceStatus, number>>;

    const totalAttendance = attendanceGroups.reduce(
      (acc, g) => acc + g.count,
      0,
    );
    const pct = (n: number) =>
      totalAttendance === 0 ? 0 : Math.round((n / totalAttendance) * 10000) / 100;

    return {
      totalSessions,
      totalAttendance,
      pendingSubmissions,
      byStatus: statusCounts,
      percentages: {
        present: pct(statusCounts.PRESENT ?? 0),
        late: pct(statusCounts.LATE ?? 0),
        absent: pct(statusCounts.ABSENT ?? 0),
        earlyCheckout: pct(statusCounts.EARLY_CHECKOUT ?? 0),
        missedCheckout: pct(statusCounts.MISSED_CHECKOUT ?? 0),
        excused: pct(statusCounts.EXCUSED ?? 0),
      },
    };
  }

  /** Per-day attendance counts within the requested window. */
  async getAttendanceTimeline(
    actor: AuthUserPayload,
    filters: ReportFilterQuery,
  ) {
    const match = await this.buildAttendanceMatch(actor, filters);
    return this.attendanceModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$scheduledDate' },
            },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);
  }

  /** Instructor-level performance breakdown. */
  async getInstructorPerformance(
    actor: AuthUserPayload,
    instructorId: string,
    filters: Omit<ReportFilterQuery, 'instructorId'>,
  ) {
    if (!Types.ObjectId.isValid(instructorId)) {
      throw new BadRequestException('Invalid instructorId');
    }
    /** Instructors may only view themselves. */
    if (this.userScope.isInstructor(actor) && actor.id !== instructorId) {
      throw new BadRequestException('You can only view your own report');
    }
    const match = await this.buildAttendanceMatch(actor, {
      ...filters,
      instructorId,
    });
    const groups = await this.attendanceModel.aggregate<{
      _id: AttendanceStatus;
      count: number;
    }>([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byStatus = Object.fromEntries(groups.map((g) => [g._id, g.count]));
    return { instructorId, byStatus };
  }

  /** Faculty-level performance grouped by faculty. */
  async getFacultyBreakdown(
    actor: AuthUserPayload,
    filters: ReportFilterQuery,
  ) {
    const match = await this.buildAttendanceMatch(actor, filters);
    return this.attendanceModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { facultyId: '$facultyId', status: '$status' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.facultyId': 1 } },
    ]);
  }

  private async buildAttendanceMatch(
    actor: AuthUserPayload,
    filters: ReportFilterQuery,
  ): Promise<Record<string, unknown>> {
    const match: Record<string, unknown> = {};
    const scope = await this.userScope.attendanceMatch(actor);
    Object.assign(match, scope);
    this.applyDateRange(match, filters);
    if (filters.facultyId) {
      this.assertSuperAdminOrSelf(actor, filters.facultyId);
      if (this.userScope.isSuperAdmin(actor)) {
        match.facultyId = new Types.ObjectId(filters.facultyId);
      }
    }
    if (filters.instructorId) {
      if (
        this.userScope.isInstructor(actor) &&
        actor.id !== filters.instructorId
      ) {
        throw new BadRequestException('You can only view your own data');
      }
      match.instructorUserId = new Types.ObjectId(filters.instructorId);
    }
    if (filters.departmentId) {
      match.departmentId = new Types.ObjectId(filters.departmentId);
    }
    if (filters.classId) {
      match.classId = new Types.ObjectId(filters.classId);
    }
    return match;
  }

  private async buildSessionMatch(
    actor: AuthUserPayload,
    filters: ReportFilterQuery,
  ): Promise<Record<string, unknown>> {
    const match: Record<string, unknown> = {};
    const scope = await this.userScope.classSessionMatch(actor);
    Object.assign(match, scope);
    if (filters.from || filters.to) {
      const range: Record<string, Date> = {};
      if (filters.from) range.$gte = new Date(filters.from);
      if (filters.to) {
        const end = new Date(filters.to);
        end.setUTCHours(23, 59, 59, 999);
        range.$lte = end;
      }
      match.scheduledDate = range;
    }
    if (filters.facultyId) {
      this.assertSuperAdminOrSelf(actor, filters.facultyId);
      match.facultyId = new Types.ObjectId(filters.facultyId);
    }
    if (filters.departmentId) {
      match.departmentId = new Types.ObjectId(filters.departmentId);
    }
    if (filters.classId) {
      match.classId = new Types.ObjectId(filters.classId);
    }
    if (filters.instructorId) {
      match.lecturerId = new Types.ObjectId(filters.instructorId);
    }
    return match;
  }

  private async buildSubmissionMatch(
    actor: AuthUserPayload,
    filters: ReportFilterQuery,
  ): Promise<Record<string, unknown>> {
    const match: Record<string, unknown> = {};
    if (this.userScope.isFacultyAdmin(actor) && actor.facultyId) {
      match.facultyId = new Types.ObjectId(actor.facultyId);
    } else if (this.userScope.isInstructor(actor)) {
      match.instructorUserId = new Types.ObjectId(actor.id);
    }
    if (filters.facultyId && this.userScope.isSuperAdmin(actor)) {
      match.facultyId = new Types.ObjectId(filters.facultyId);
    }
    return match;
  }

  private applyDateRange(
    match: Record<string, unknown>,
    filters: ReportFilterQuery,
  ): void {
    if (!filters.from && !filters.to) return;
    const range: Record<string, Date> = {};
    if (filters.from) range.$gte = new Date(filters.from);
    if (filters.to) {
      const end = new Date(filters.to);
      end.setUTCHours(23, 59, 59, 999);
      range.$lte = end;
    }
    match.scheduledDate = range;
  }

  /** Faculty Admins may not request `facultyId` for another faculty. */
  private assertSuperAdminOrSelf(
    actor: AuthUserPayload,
    facultyId: string,
  ): void {
    if (
      this.userScope.isFacultyAdmin(actor) &&
      String(actor.facultyId) !== String(facultyId)
    ) {
      throw new BadRequestException(
        'You can only request reports for your own faculty',
      );
    }
  }
}
