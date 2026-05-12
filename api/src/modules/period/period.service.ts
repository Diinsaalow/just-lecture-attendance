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
import { normalizeRoleName } from '../../common/casl/role-ability-templates';
import { EntityStatus } from '../../common/enums/entity-status.enum';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { CourseService } from '../course/course.service';
import { LectureClassService } from '../classes/lecture-class.service';
import { SemesterService } from '../semester/semester.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { HallService } from '../hall/hall.service';
import { Department, DepartmentDocument } from '../department/schemas/department.schema';
import { RolesService } from '../roles/roles.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { Period, PeriodDocument } from './schemas/period.schema';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { parseHHmm, timeWindowsOverlap } from './utils/period-time.util';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  AuditAction,
  AuditEntity,
} from '../audit-log/enums/audit-action.enum';

@Injectable()
export class PeriodService {
  constructor(
    @InjectModel(Period.name)
    private readonly periodModel: Model<PeriodDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    private readonly lectureClassService: LectureClassService,
    private readonly courseService: CourseService,
    private readonly semesterService: SemesterService,
    private readonly userScopeService: UserScopeService,
    private readonly hallService: HallService,
    private readonly rolesService: RolesService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(
    dto: CreatePeriodDto,
    createdByUserId: string,
    user: AuthUserPayload,
  ): Promise<Period> {
    this.assertTimeOrder(dto.from, dto.to);

    await this.userScopeService.ensureLectureClassInScope(user, dto.classId);
    await this.userScopeService.ensureCourseInScope(user, dto.courseId);
    await this.userScopeService.ensureSemesterInScope(user, dto.semesterId);

    await this.lectureClassService.ensureExists(dto.classId);
    await this.courseService.ensureExists(dto.courseId);
    await this.semesterService.ensureExists(dto.semesterId);
    await this.assertLecturerIsInstructor(dto.lecturerId, dto.classId, user);

    await this.assertMatchingDepartment(dto.classId, dto.courseId);
    await this.validateOptionalHall(user, dto.classId, dto.hallId);

    await this.assertNoConflicts({
      classId: dto.classId,
      semesterId: dto.semesterId,
      day: dto.day,
      from: dto.from,
      to: dto.to,
      lecturerId: dto.lecturerId,
      hallId: dto.hallId ?? null,
    });

    const created = await this.periodModel.create({
      classId: new Types.ObjectId(dto.classId),
      courseId: new Types.ObjectId(dto.courseId),
      lecturerId: new Types.ObjectId(dto.lecturerId),
      semesterId: new Types.ObjectId(dto.semesterId),
      day: dto.day,
      type: dto.type,
      from: dto.from,
      to: dto.to,
      ...(dto.hallId ? { hallId: new Types.ObjectId(dto.hallId) } : {}),
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
    await this.auditLog.record({
      actor: user,
      action: AuditAction.CREATE,
      entityType: AuditEntity.PERIOD,
      entityId: created._id,
      after: {
        classId: dto.classId,
        day: dto.day,
        from: dto.from,
        to: dto.to,
        lecturerId: dto.lecturerId,
      },
    });
    return created;
  }

  async findAllPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
  ): Promise<PaginatedResult<Period>> {
    const baseMatch = await this.userScopeService.periodMatch(user);
    return paginateFind<PeriodDocument>(this.periodModel, q, {
      searchFields: ['day', 'type', 'from', 'to', 'status'],
      defaultSort: { createdAt: -1 },
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'courseId', select: 'name' },
        { path: 'lecturerId', select: 'username firstName lastName' },
        { path: 'semesterId', select: 'name' },
        { path: 'hallId', select: 'name code' },
      ],
      baseMatch: Object.keys(baseMatch).length > 0 ? baseMatch : undefined,
    });
  }

  async bulkRemove(
    ids: string[],
    user: AuthUserPayload,
  ): Promise<{ deletedCount: number; message: string }> {
    const valid = ids.filter((id) => Types.ObjectId.isValid(id));
    if (!valid.length) {
      return { deletedCount: 0, message: 'No valid ids' };
    }
    const baseMatch = await this.userScopeService.periodMatch(user);
    const filter: Record<string, unknown> = {
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const r = await this.periodModel.deleteMany(filter as never).exec();
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string, user: AuthUserPayload): Promise<Period> {
    await this.userScopeService.ensurePeriodInScope(user, id);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Period not found');
    }
    const doc = await this.periodModel
      .findById(id)
      .populate([
        { path: 'classId', select: 'name' },
        { path: 'courseId', select: 'name' },
        { path: 'lecturerId', select: 'username firstName lastName' },
        { path: 'semesterId', select: 'name' },
        { path: 'hallId', select: 'name code' },
      ])
      .exec();
    if (!doc) {
      throw new NotFoundException('Period not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<Period | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.periodModel.findById(id).exec();
  }

  async update(
    id: string,
    dto: UpdatePeriodDto,
    user: AuthUserPayload,
  ): Promise<Period> {
    await this.userScopeService.ensurePeriodInScope(user, id);
    const existing = await this.findByIdOrNull(id);
    if (!existing) {
      throw new NotFoundException('Period not found');
    }

    const classId = dto.classId ?? String(existing.classId);
    const courseId = dto.courseId ?? String(existing.courseId);
    const semesterId = dto.semesterId ?? String(existing.semesterId);
    const day = dto.day ?? existing.day;
    const from = dto.from ?? existing.from;
    const to = dto.to ?? existing.to;
    const lecturerId = dto.lecturerId ?? String(existing.lecturerId);
    const hallIdRaw =
      dto.hallId !== undefined
        ? dto.hallId
        : existing.hallId
          ? String(existing.hallId)
          : null;

    if (dto.from || dto.to) {
      this.assertTimeOrder(from, to);
    }

    if (dto.classId) {
      await this.userScopeService.ensureLectureClassInScope(user, dto.classId);
      await this.lectureClassService.ensureExists(dto.classId);
    }
    if (dto.courseId) {
      await this.userScopeService.ensureCourseInScope(user, dto.courseId);
      await this.courseService.ensureExists(dto.courseId);
    }
    if (dto.semesterId) {
      await this.userScopeService.ensureSemesterInScope(user, dto.semesterId);
      await this.semesterService.ensureExists(dto.semesterId);
    }
    if (dto.lecturerId) {
      await this.assertLecturerIsInstructor(dto.lecturerId, classId, user);
    }

    if (dto.classId ?? dto.courseId) {
      await this.assertMatchingDepartment(classId, courseId);
    }

    if (dto.hallId !== undefined && dto.hallId) {
      await this.validateOptionalHall(user, classId, dto.hallId);
    }

    if (
      dto.classId ||
      dto.semesterId ||
      dto.day ||
      dto.from ||
      dto.to ||
      dto.lecturerId ||
      dto.hallId !== undefined
    ) {
      await this.assertNoConflicts(
        {
          classId,
          semesterId,
          day,
          from,
          to,
          lecturerId,
          hallId: hallIdRaw,
        },
        id,
      );
    }

    const patch: Record<string, unknown> = { ...dto };
    if (dto.classId) {
      patch.classId = new Types.ObjectId(dto.classId);
    }
    if (dto.courseId) {
      patch.courseId = new Types.ObjectId(dto.courseId);
    }
    if (dto.lecturerId) {
      patch.lecturerId = new Types.ObjectId(dto.lecturerId);
    }
    if (dto.semesterId) {
      patch.semesterId = new Types.ObjectId(dto.semesterId);
    }
    if (dto.hallId !== undefined) {
      patch.hallId = dto.hallId ? new Types.ObjectId(dto.hallId) : null;
    }

    const doc = await this.periodModel
      .findByIdAndUpdate(id, patch, { new: true })
      .exec();
    if (!doc) {
      throw new NotFoundException('Period not found');
    }
    await this.auditLog.record({
      actor: user,
      action: AuditAction.UPDATE,
      entityType: AuditEntity.PERIOD,
      entityId: doc._id,
      after: patch,
    });
    return doc;
  }

  async remove(id: string, user: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensurePeriodInScope(user, id);
    const doc = await this.periodModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Period not found');
    }
    await this.auditLog.record({
      actor: user,
      action: AuditAction.DELETE,
      entityType: AuditEntity.PERIOD,
      entityId: id,
      before: { classId: String(doc.classId), day: doc.day, from: doc.from },
    });
  }

  /**
   * Mobile: list periods assigned to the authenticated instructor, optionally
   * scoped to a single semester. Sorted by day-of-week then start time.
   */
  async findMine(
    user: AuthUserPayload,
    semesterId?: string,
  ): Promise<Period[]> {
    if (!this.userScopeService.isInstructor(user)) {
      throw new BadRequestException(
        'This endpoint is only available for instructor accounts',
      );
    }
    const filter: Record<string, unknown> = {
      lecturerId: new Types.ObjectId(user.id),
      status: EntityStatus.ACTIVE,
    };
    if (semesterId) {
      if (!Types.ObjectId.isValid(semesterId)) {
        throw new BadRequestException('Invalid semesterId');
      }
      filter.semesterId = new Types.ObjectId(semesterId);
    }

    const periods = await this.periodModel
      .find(filter)
      .populate([
        { path: 'classId', select: 'name' },
        { path: 'courseId', select: 'name' },
        { path: 'semesterId', select: 'name startDate endDate' },
        { path: 'hallId', select: 'name code' },
      ])
      .exec();

    const daysOrder = [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ];
    return periods.sort((a, b) => {
      const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.from.localeCompare(b.from);
    });
  }

  async findByClass(classId: string, user: AuthUserPayload): Promise<Period[]> {
    await this.userScopeService.ensureLectureClassInScope(user, classId);
    const baseMatch = await this.userScopeService.periodMatch(user);
    const filter = {
      classId: new Types.ObjectId(classId),
      ...baseMatch,
    };

    const daysOrder = [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ];

    const periods = await this.periodModel
      .find(filter)
      .populate([
        { path: 'courseId', select: 'name' },
        { path: 'lecturerId', select: 'username firstName lastName' },
        { path: 'semesterId', select: 'name' },
        { path: 'hallId', select: 'name code' },
      ])
      .exec();

    return periods.sort((a, b) => {
      const dayA = daysOrder.indexOf(a.day);
      const dayB = daysOrder.indexOf(b.day);
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      return a.from.localeCompare(b.from);
    });
  }

  async findAssignedClasses(user: AuthUserPayload): Promise<any[]> {
    if (normalizeRoleName(user.role.name) !== 'instructor') {
      throw new BadRequestException('This endpoint is only for instructors');
    }

    const periods = await this.periodModel
      .find({
        lecturerId: new Types.ObjectId(user.id),
        status: EntityStatus.ACTIVE,
      })
      .populate({
        path: 'classId',
        populate: { path: 'departmentId', select: 'name' },
      })
      .lean()
      .exec();

    // Group by classId to get unique classes
    const classMap = new Map<string, any>();
    for (const p of periods) {
      const cls = p.classId as any;
      if (cls && !classMap.has(String(cls._id))) {
        classMap.set(String(cls._id), {
          ...cls,
          id: String(cls._id),
          // We can add more info here if needed
        });
      }
    }

    return Array.from(classMap.values());
  }

  private assertTimeOrder(from: string, to: string): void {
    const fromM = parseHHmm(from, 'from');
    const toM = parseHHmm(to, 'to');
    if (fromM >= toM) {
      throw new BadRequestException('from time must be earlier than to time');
    }
  }

  private async assertLecturerIsInstructor(
    lecturerId: string,
    classId: string,
    actor: AuthUserPayload,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(lecturerId)) {
      throw new BadRequestException('Invalid lecturer id');
    }
    const lecturer = await this.userModel
      .findOne({ _id: lecturerId, isActive: true })
      .populate<{ role: { name: string } | null }>('role', 'name')
      .lean<{
        _id: Types.ObjectId;
        isActive: boolean;
        facultyId?: Types.ObjectId;
        role: { name: string } | null;
      } | null>();

    if (!lecturer) {
      throw new BadRequestException('Lecturer user not found or inactive');
    }
    const roleName = lecturer.role?.name
      ? normalizeRoleName(lecturer.role.name)
      : '';
    if (roleName !== UserRole.INSTRUCTOR) {
      throw new BadRequestException(
        'Assigned lecturer must be an instructor user',
      );
    }

    /** Faculty Admins can only assign instructors that belong to their faculty (or are unassigned but the class is theirs). */
    if (this.userScopeService.isFacultyAdmin(actor)) {
      if (lecturer.facultyId) {
        if (String(lecturer.facultyId) !== String(actor.facultyId)) {
          throw new ForbiddenException(
            'Instructor belongs to a different faculty',
          );
        }
      } else {
        /** No faculty on instructor — ensure the class is inside the actor's faculty (scope already enforced above). */
        const lectureClass =
          await this.lectureClassService.findByIdOrNull(classId);
        if (!lectureClass) {
          throw new BadRequestException('Class not found');
        }
        const dept = await this.departmentModel
          .findById(lectureClass.departmentId)
          .select('facultyId')
          .lean();
        if (
          !dept ||
          String(dept.facultyId) !== String(actor.facultyId)
        ) {
          throw new ForbiddenException(
            'Class belongs to a different faculty',
          );
        }
      }
    }
  }

  /**
   * Detects overlap with any other `ACTIVE` period that shares the same semester+day for:
   *   - same lecturerId   (instructor conflict)
   *   - same hallId       (hall conflict, when hallId is set)
   *   - same classId      (class conflict)
   * Excludes `excludeId` (used by update).
   */
  private async assertNoConflicts(
    args: {
      classId: string;
      semesterId: string;
      day: string;
      from: string;
      to: string;
      lecturerId: string;
      hallId: string | null;
    },
    excludeId?: string,
  ): Promise<void> {
    const fromM = parseHHmm(args.from, 'from');
    const toM = parseHHmm(args.to, 'to');

    const peerFilter: Record<string, unknown> = {
      semesterId: new Types.ObjectId(args.semesterId),
      day: args.day,
      status: EntityStatus.ACTIVE,
    };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      peerFilter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const orClauses: Record<string, unknown>[] = [
      { lecturerId: new Types.ObjectId(args.lecturerId) },
      { classId: new Types.ObjectId(args.classId) },
    ];
    if (args.hallId) {
      orClauses.push({ hallId: new Types.ObjectId(args.hallId) });
    }

    const peers = await this.periodModel
      .find({ ...peerFilter, $or: orClauses })
      .select('lecturerId classId hallId from to')
      .lean<
        Array<{
          _id: Types.ObjectId;
          lecturerId: Types.ObjectId;
          classId: Types.ObjectId;
          hallId?: Types.ObjectId;
          from: string;
          to: string;
        }>
      >();

    for (const peer of peers) {
      const peerFromM = parseHHmm(peer.from, 'from');
      const peerToM = parseHHmm(peer.to, 'to');
      if (!timeWindowsOverlap(fromM, toM, peerFromM, peerToM)) {
        continue;
      }
      if (String(peer.lecturerId) === args.lecturerId) {
        throw new ConflictException(
          'Instructor already has a period at this time',
        );
      }
      if (String(peer.classId) === args.classId) {
        throw new ConflictException(
          'Class already has a period at this time',
        );
      }
      if (args.hallId && peer.hallId && String(peer.hallId) === args.hallId) {
        throw new ConflictException(
          'Hall is already booked for another period at this time',
        );
      }
    }
  }

  private async assertMatchingDepartment(
    classId: string,
    courseId: string,
  ): Promise<void> {
    const lectureClass = await this.lectureClassService.findByIdOrNull(classId);
    const course = await this.courseService.findByIdOrNull(courseId);
    if (!lectureClass || !course) {
      throw new BadRequestException('Class or course not found');
    }
    if (String(lectureClass.departmentId) !== String(course.departmentId)) {
      throw new BadRequestException(
        'Course and class must belong to the same department',
      );
    }
  }

  private async validateOptionalHall(
    user: AuthUserPayload,
    classId: string,
    hallId?: string | null,
  ): Promise<void> {
    if (!hallId) {
      return;
    }
    await this.userScopeService.ensureHallInScope(user, hallId);
    await this.hallService.ensureExists(hallId);
    const lectureClass = await this.lectureClassService.findByIdOrNull(classId);
    if (!lectureClass) {
      throw new BadRequestException('Class not found');
    }
    const hallCampusId = await this.hallService.findLeanCampusId(hallId);
    if (
      !hallCampusId ||
      String(hallCampusId) !== String(lectureClass.campusId)
    ) {
      throw new BadRequestException(
        'Hall must belong to the same campus as the class',
      );
    }
  }
}
