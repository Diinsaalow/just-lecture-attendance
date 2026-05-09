import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { EntityStatus } from '../../common/enums/entity-status.enum';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { Period, PeriodDocument } from '../period/schemas/period.schema';
import { Semester, SemesterDocument } from '../semester/schemas/semester.schema';
import { SemesterService } from '../semester/semester.service';
import {
  LectureClass,
  LectureClassDocument,
} from '../classes/schemas/lecture-class.schema';
import {
  Department,
  DepartmentDocument,
} from '../department/schemas/department.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from './schemas/class-session.schema';
import { ClassSessionStatus } from './enums/class-session-status.enum';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { GenerateClassSessionsDto } from './dto/generate-class-sessions.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import {
  eachUtcCalendarDayInclusive,
  startOfUtcDay,
  utcDayIndexFromWeekdayName,
} from './utils/session-calendar.util';

@Injectable()
export class ClassSessionService {
  constructor(
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Period.name) private readonly periodModel: Model<PeriodDocument>,
    @InjectModel(LectureClass.name)
    private readonly lectureClassModel: Model<LectureClassDocument>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<SemesterDocument>,
    private readonly semesterService: SemesterService,
    private readonly userScopeService: UserScopeService,
  ) {}

  /**
   * Semesters that have at least one timetable period visible to the user.
   * When `classId` is set, only semesters that have periods for that class (in scope).
   */
  async findSemestersForGeneration(
    user: AuthUserPayload,
    classId?: string,
  ): Promise<Array<{ _id: Types.ObjectId; name: string }>> {
    const periodScope = await this.userScopeService.periodMatch(user);
    const periodFilter: Record<string, unknown> =
      Object.keys(periodScope).length > 0
        ? { ...(periodScope as Record<string, unknown>) }
        : {};
    if (classId !== undefined && classId !== '') {
      if (!Types.ObjectId.isValid(classId)) {
        throw new BadRequestException('Invalid classId');
      }
      await this.userScopeService.ensureLectureClassInScope(user, classId);
      periodFilter.classId = new Types.ObjectId(classId);
    }
    const semIds = await this.periodModel.distinct('semesterId', periodFilter);
    if (!semIds.length) {
      return [];
    }
    const rows = await this.semesterModel
      .find({ _id: { $in: semIds } })
      .select('name')
      .sort({ startDate: -1 })
      .lean();
    return rows.map((r) => ({ _id: r._id, name: r.name }));
  }

  /** Classes that have at least one timetable period visible to the user. */
  async findClassesForGeneration(
    user: AuthUserPayload,
  ): Promise<Array<{ _id: Types.ObjectId; name: string }>> {
    const periodScope = await this.userScopeService.periodMatch(user);
    const periodFilter =
      Object.keys(periodScope).length > 0
        ? (periodScope as Record<string, unknown>)
        : {};
    const classIds = await this.periodModel.distinct('classId', periodFilter);
    if (!classIds.length) {
      return [];
    }
    const rows = await this.lectureClassModel
      .find({ _id: { $in: classIds } })
      .select('name')
      .sort({ name: 1 })
      .lean();
    return rows.map((r) => ({ _id: r._id, name: r.name }));
  }

  async generateForSemester(
    dto: GenerateClassSessionsDto,
    user: AuthUserPayload,
  ): Promise<{ upserted: number; matchedExisting: number }> {
    await this.userScopeService.ensureSemesterInScope(user, dto.semesterId);
    if (dto.classId) {
      await this.userScopeService.ensureLectureClassInScope(user, dto.classId);
    }
    const semester = await this.semesterService.findByIdOrNull(dto.semesterId);
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    const periodQuery: Record<string, unknown> = {
      semesterId: new Types.ObjectId(dto.semesterId),
      status: EntityStatus.ACTIVE,
    };
    if (dto.classId) {
      periodQuery.classId = new Types.ObjectId(dto.classId);
    }

    const periods = await this.periodModel.find(periodQuery).lean();

    if (!periods.length) {
      return { upserted: 0, matchedExisting: 0 };
    }

    const classIds = [...new Set(periods.map((p) => String(p.classId)))];
    const lectureClasses = await this.lectureClassModel
      .find({ _id: { $in: classIds.map((id) => new Types.ObjectId(id)) } })
      .lean();
    const lcById = new Map(lectureClasses.map((c) => [String(c._id), c]));

    const deptIds = [
      ...new Set(lectureClasses.map((c) => String(c.departmentId))),
    ];
    const depts = await this.departmentModel
      .find({ _id: { $in: deptIds.map((id) => new Types.ObjectId(id)) } })
      .lean();
    const deptById = new Map(depts.map((d) => [String(d._id), d]));

    const start = startOfUtcDay(new Date(semester.startDate));
    const end = startOfUtcDay(new Date(semester.endDate));
    const calendarDays = eachUtcCalendarDayInclusive(start, end);

    const bulkOps = [] as Array<{
      updateOne: {
        filter: { periodId: Types.ObjectId; scheduledDate: Date };
        update: { $setOnInsert: Record<string, unknown> };
        upsert: boolean;
      };
    }>;

    for (const period of periods) {
      const lc = lcById.get(String(period.classId));
      const dept = lc ? deptById.get(String(lc.departmentId)) : undefined;
      if (!lc || !dept) {
        continue;
      }
      const dow = utcDayIndexFromWeekdayName(period.day);
      if (dow === null) {
        continue;
      }

      for (const d of calendarDays) {
        if (d.getUTCDay() !== dow) {
          continue;
        }
        const scheduledDate = startOfUtcDay(d);
        const insertDoc = {
          periodId: period._id,
          scheduledDate,
          semesterId: period.semesterId,
          classId: period.classId,
          courseId: period.courseId,
          lecturerId: period.lecturerId,
          ...(period.hallId ? { hallId: period.hallId } : {}),
          dayLabel: period.day,
          fromTime: period.from,
          toTime: period.to,
          type: period.type,
          facultyId: dept.facultyId,
          departmentId: lc.departmentId,
          campusId: lc.campusId,
          academicYearId: lc.academicYearId,
          status: ClassSessionStatus.SCHEDULED,
          createdBy: new Types.ObjectId(user.id),
        };

        bulkOps.push({
          updateOne: {
            filter: {
              periodId: period._id,
              scheduledDate,
            },
            update: { $setOnInsert: insertDoc },
            upsert: true,
          },
        });
      }
    }

    if (!bulkOps.length) {
      return { upserted: 0, matchedExisting: 0 };
    }

    const result = await this.classSessionModel.bulkWrite(bulkOps, {
      ordered: false,
    });

    return {
      upserted: result.upsertedCount,
      matchedExisting: result.matchedCount,
    };
  }

  async create(
    dto: CreateClassSessionDto,
    user: AuthUserPayload,
  ): Promise<ClassSession> {
    const snapshot = await this.buildSnapshotFromPeriod(
      dto.periodId,
      dto.scheduledDate,
      user,
    );

    try {
      const doc = await this.classSessionModel.create({
        ...snapshot,
        status: dto.status ?? ClassSessionStatus.SCHEDULED,
        createdBy: new Types.ObjectId(user.id),
      });
      return this.populateSession(doc._id as Types.ObjectId);
    } catch (error) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  async findAllPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
  ): Promise<PaginatedResult<ClassSession>> {
    const baseMatch = await this.userScopeService.classSessionMatch(user);
    return paginateFind<ClassSessionDocument>(this.classSessionModel, q, {
      searchFields: ['dayLabel', 'fromTime', 'toTime', 'status', 'type'],
      defaultSort: { scheduledDate: -1, fromTime: 1 },
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'courseId', select: 'name' },
        { path: 'lecturerId', select: 'username firstName lastName' },
        { path: 'semesterId', select: 'name' },
        { path: 'hallId', select: 'name code' },
      ],
      baseMatch:
        Object.keys(baseMatch).length > 0 ? baseMatch : undefined,
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
    const baseMatch = await this.userScopeService.classSessionMatch(user);
    const filter: Record<string, unknown> = {
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const r = await this.classSessionModel.deleteMany(filter as never).exec();
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string, user: AuthUserPayload): Promise<ClassSession> {
    await this.userScopeService.ensureClassSessionInScope(user, id);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Class session not found');
    }
    const doc = await this.classSessionModel
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
      throw new NotFoundException('Class session not found');
    }
    return doc;
  }

  async update(
    id: string,
    dto: UpdateClassSessionDto,
    user: AuthUserPayload,
  ): Promise<ClassSession> {
    await this.userScopeService.ensureClassSessionInScope(user, id);
    const existing = await this.classSessionModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Class session not found');
    }

    const patch: Record<string, unknown> = {};
    const unset: Record<string, ''> = {};

    if (dto.periodId || dto.scheduledDate) {
      const snapshot = await this.buildSnapshotFromPeriod(
        dto.periodId ?? String(existing.periodId),
        dto.scheduledDate ?? existing.scheduledDate.toISOString(),
        user,
      );
      Object.assign(patch, snapshot);
      if (!snapshot.hallId) {
        unset.hallId = '';
        delete patch.hallId;
      }
    }

    if (dto.status) {
      patch.status = dto.status;
    }

    if (!Object.keys(patch).length && !Object.keys(unset).length) {
      return this.populateSession(existing._id as Types.ObjectId);
    }

    try {
      const update: Record<string, unknown> = { $set: patch };
      if (Object.keys(unset).length) {
        update.$unset = unset;
      }
      const doc = await this.classSessionModel
        .findByIdAndUpdate(id, update, { new: true })
        .populate([
          { path: 'classId', select: 'name' },
          { path: 'courseId', select: 'name' },
          { path: 'lecturerId', select: 'username firstName lastName' },
          { path: 'semesterId', select: 'name' },
          { path: 'hallId', select: 'name code' },
        ])
        .exec();
      if (!doc) {
        throw new NotFoundException('Class session not found');
      }
      return doc;
    } catch (error) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  async remove(id: string, user: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensureClassSessionInScope(user, id);
    const doc = await this.classSessionModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Class session not found');
    }
  }

  private async buildSnapshotFromPeriod(
    periodId: string,
    scheduledDateInput: string,
    user: AuthUserPayload,
  ): Promise<Record<string, unknown>> {
    await this.userScopeService.ensurePeriodInScope(user, periodId);

    const scheduledDate = startOfUtcDay(new Date(scheduledDateInput));
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduled date');
    }

    const period = await this.periodModel.findById(periodId).lean();
    if (!period) {
      throw new NotFoundException('Period not found');
    }

    const semester = await this.semesterModel.findById(period.semesterId).lean();
    if (!semester) {
      throw new BadRequestException('Period semester was not found');
    }
    const start = startOfUtcDay(new Date(semester.startDate));
    const end = startOfUtcDay(new Date(semester.endDate));
    if (scheduledDate < start || scheduledDate > end) {
      throw new BadRequestException(
        'Scheduled date must be within the period semester date range',
      );
    }

    const dow = utcDayIndexFromWeekdayName(period.day);
    if (dow === null || scheduledDate.getUTCDay() !== dow) {
      throw new BadRequestException(
        'Scheduled date must match the selected period weekday',
      );
    }

    const lectureClass = await this.lectureClassModel
      .findById(period.classId)
      .lean();
    if (!lectureClass) {
      throw new BadRequestException('Period class was not found');
    }
    const department = await this.departmentModel
      .findById(lectureClass.departmentId)
      .lean();
    if (!department) {
      throw new BadRequestException('Class department was not found');
    }

    return {
      periodId: new Types.ObjectId(periodId),
      scheduledDate,
      semesterId: period.semesterId,
      classId: period.classId,
      courseId: period.courseId,
      lecturerId: period.lecturerId,
      ...(period.hallId ? { hallId: period.hallId } : {}),
      dayLabel: period.day,
      fromTime: period.from,
      toTime: period.to,
      type: period.type,
      facultyId: department.facultyId,
      departmentId: lectureClass.departmentId,
      campusId: lectureClass.campusId,
      academicYearId: lectureClass.academicYearId,
    };
  }

  private async populateSession(id: Types.ObjectId): Promise<ClassSession> {
    const doc = await this.classSessionModel
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
      throw new NotFoundException('Class session not found');
    }
    return doc;
  }

  private throwIfDuplicate(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ConflictException(
        'A class session already exists for this period and date',
      );
    }
  }
}
