import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { UserScopeService } from '../../common/casl/user-scope.service';
import { AttendanceStatus } from './enums/attendance-status.enum';
import { CheckInMethod } from './enums/check-in-method.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    private readonly validationService: AttendanceValidationService,
    private readonly auditLog: AuditLogService,
    private readonly userScope: UserScopeService,
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
      searchFields: ['status', 'scheduledStart', 'scheduledEnd', 'checkInMethod'],
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
        { path: 'facultyId', select: 'name' },
        { path: 'departmentId', select: 'name' },
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

  async findAllPaginated(query: TableQueryDto, user: AuthUserPayload) {
    const scope = await this.userScope.attendanceMatch(user);
    const filters = this.buildListFilters(query);
    const baseMatch = this.mergeScopeWithFilters(user, scope, filters);
    return paginateFind<AttendanceRecordDocument>(this.attendanceModel, query, {
      searchFields: ['status', 'scheduledStart', 'scheduledEnd', 'checkInMethod'],
      defaultSort: { scheduledDate: -1 },
      populate: [
        {
          path: 'instructorUserId',
          select:
            'username firstName lastName email registeredDeviceId pendingDeviceId',
        },
        { path: 'facultyId', select: 'name' },
        { path: 'departmentId', select: 'name' },
        { path: 'classId', select: 'name' },
        { path: 'courseId', select: 'name' },
        { path: 'hallId', select: 'name code' },
      ],
      baseMatch,
    });
  }

  async findByIdForUser(id: string, user: AuthUserPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Attendance record not found');
    }
    const scope = await this.userScope.attendanceMatch(user);
    const baseMatch = this.mergeScopeWithFilters(user, scope, {
      _id: new Types.ObjectId(id),
    });
    const doc = await this.attendanceModel
      .findOne(baseMatch as never)
      .populate([
        {
          path: 'instructorUserId',
          select:
            'username firstName lastName email registeredDeviceId pendingDeviceId',
        },
        { path: 'facultyId', select: 'name' },
        { path: 'departmentId', select: 'name' },
        { path: 'classId', select: 'name' },
        { path: 'courseId', select: 'name' },
        { path: 'hallId', select: 'name code' },
        {
          path: 'sessionId',
          select: 'scheduledDate fromTime toTime status type',
        },
      ])
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException('Attendance record not found');
    }
    return doc;
  }

  private buildListFilters(q: TableQueryDto): Record<string, unknown> {
    const raw = q.query ?? {};
    const pick = (k: string): string | undefined => {
      const v = raw[k];
      if (v === undefined || v === null || v === '') return undefined;
      const s = Array.isArray(v) ? v[0] : String(v);
      return s.trim() === '' ? undefined : s;
    };
    const out: Record<string, unknown> = {};

    for (const key of [
      'facultyId',
      'departmentId',
      'classId',
      'courseId',
    ] as const) {
      const s = pick(key);
      if (s && Types.ObjectId.isValid(s)) {
        out[key] = new Types.ObjectId(s);
      }
    }

    const inst = pick('instructorUserId') ?? pick('instructorId');
    if (inst && Types.ObjectId.isValid(inst)) {
      out.instructorUserId = new Types.ObjectId(inst);
    }

    const st = pick('status');
    if (st && (Object.values(AttendanceStatus) as string[]).includes(st)) {
      out.status = st;
    }

    const m = pick('checkInMethod');
    if (m && (Object.values(CheckInMethod) as string[]).includes(m)) {
      out.checkInMethod = m;
    }

    const from = pick('startDate') ?? pick('from') ?? q.startDate;
    const to = pick('endDate') ?? pick('to') ?? q.endDate;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setUTCHours(23, 59, 59, 999);
        range.$lte = end;
      }
      out.scheduledDate = range;
    }

    return out;
  }

  /**
   * Merges row-level filters with role scope. Instructors cannot widen scope
   * via query params; faculty admins cannot pick another faculty.
   */
  private mergeScopeWithFilters(
    user: AuthUserPayload,
    scope: Record<string, unknown>,
    filters: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    const scopedFilters = { ...filters };

    if (this.userScope.isInstructor(user)) {
      delete scopedFilters.instructorUserId;
      delete scopedFilters.facultyId;
    } else if (this.userScope.isFacultyAdmin(user)) {
      delete scopedFilters.facultyId;
    }

    const parts: Record<string, unknown>[] = [];
    if (Object.keys(scope).length > 0) parts.push(scope);
    if (Object.keys(scopedFilters).length > 0) parts.push(scopedFilters);
    if (parts.length === 0) return undefined;
    if (parts.length === 1) return parts[0];
    return { $and: parts };
  }
}
