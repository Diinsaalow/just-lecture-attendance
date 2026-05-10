import {
  BadRequestException,
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
import { CourseService } from '../course/course.service';
import { LectureClassService } from '../classes/lecture-class.service';
import { SemesterService } from '../semester/semester.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { HallService } from '../hall/hall.service';
import { Period, PeriodDocument } from './schemas/period.schema';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

@Injectable()
export class PeriodService {
  constructor(
    @InjectModel(Period.name) private readonly periodModel: Model<PeriodDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly lectureClassService: LectureClassService,
    private readonly courseService: CourseService,
    private readonly semesterService: SemesterService,
    private readonly userScopeService: UserScopeService,
    private readonly hallService: HallService,
  ) {}

  async create(
    dto: CreatePeriodDto,
    createdByUserId: string,
    user: AuthUserPayload,
  ): Promise<Period> {
    await this.userScopeService.ensureLectureClassInScope(user, dto.classId);
    await this.userScopeService.ensureCourseInScope(user, dto.courseId);
    await this.userScopeService.ensureSemesterInScope(user, dto.semesterId);

    await this.lectureClassService.ensureExists(dto.classId);
    await this.courseService.ensureExists(dto.courseId);
    await this.semesterService.ensureExists(dto.semesterId);
    await this.ensureActiveUser(dto.lecturerId);

    await this.assertMatchingDepartment(dto.classId, dto.courseId);
    await this.validateOptionalHall(user, dto.classId, dto.hallId);

    return this.periodModel.create({
      classId: new Types.ObjectId(dto.classId),
      courseId: new Types.ObjectId(dto.courseId),
      lecturerId: new Types.ObjectId(dto.lecturerId),
      semesterId: new Types.ObjectId(dto.semesterId),
      day: dto.day,
      type: dto.type,
      from: dto.from,
      to: dto.to,
      ...(dto.hallId
        ? { hallId: new Types.ObjectId(dto.hallId) }
        : {}),
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
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
      await this.ensureActiveUser(dto.lecturerId);
    }

    if (dto.classId ?? dto.courseId) {
      await this.assertMatchingDepartment(classId, courseId);
    }

    if (dto.hallId !== undefined && dto.hallId) {
      await this.validateOptionalHall(user, classId, dto.hallId);
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
      patch.hallId = dto.hallId
        ? new Types.ObjectId(dto.hallId)
        : null;
    }

    const doc = await this.periodModel
      .findByIdAndUpdate(id, patch, { new: true })
      .exec();
    if (!doc) {
      throw new NotFoundException('Period not found');
    }
    return doc;
  }

  async remove(id: string, user: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensurePeriodInScope(user, id);
    const doc = await this.periodModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Period not found');
    }
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

  private async ensureActiveUser(userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid lecturer id');
    }
    const exists = await this.userModel.exists({ _id: userId, isActive: true });
    if (!exists) {
      throw new BadRequestException('Lecturer user not found or inactive');
    }
  }

  private async assertMatchingDepartment(
    classId: string,
    courseId: string,
  ): Promise<void> {
    const lectureClass =
      await this.lectureClassService.findByIdOrNull(classId);
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
    const lectureClass =
      await this.lectureClassService.findByIdOrNull(classId);
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
