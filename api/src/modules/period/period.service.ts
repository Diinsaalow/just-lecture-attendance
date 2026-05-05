import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { CourseService } from '../course/course.service';
import { LectureClassService } from '../classes/lecture-class.service';
import { SemesterService } from '../semester/semester.service';
import { User, UserDocument } from '../users/schemas/user.schema';
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
  ) {}

  async create(dto: CreatePeriodDto, createdByUserId: string): Promise<Period> {
    await this.lectureClassService.ensureExists(dto.classId);
    await this.courseService.ensureExists(dto.courseId);
    await this.semesterService.ensureExists(dto.semesterId);
    await this.ensureActiveUser(dto.lecturerId);

    await this.assertMatchingDepartment(dto.classId, dto.courseId);

    return this.periodModel.create({
      classId: new Types.ObjectId(dto.classId),
      courseId: new Types.ObjectId(dto.courseId),
      lecturerId: new Types.ObjectId(dto.lecturerId),
      semesterId: new Types.ObjectId(dto.semesterId),
      day: dto.day,
      type: dto.type,
      from: dto.from,
      to: dto.to,
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(q: TableQueryDto): Promise<PaginatedResult<Period>> {
    return paginateFind<PeriodDocument>(this.periodModel, q, {
      searchFields: ['day', 'type', 'from', 'to', 'status'],
      defaultSort: { createdAt: -1 },
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'courseId', select: 'name' },
        { path: 'lecturerId', select: 'username' },
        { path: 'semesterId', select: 'name' },
      ],
    });
  }

  async bulkRemove(
    ids: string[],
  ): Promise<{ deletedCount: number; message: string }> {
    const valid = ids.filter((id) => Types.ObjectId.isValid(id));
    if (!valid.length) {
      return { deletedCount: 0, message: 'No valid ids' };
    }
    const r = await this.periodModel.deleteMany({ _id: { $in: valid } });
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string): Promise<Period> {
    const doc = await this.findByIdOrNull(id);
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

  async update(id: string, dto: UpdatePeriodDto): Promise<Period> {
    const existing = await this.findByIdOrNull(id);
    if (!existing) {
      throw new NotFoundException('Period not found');
    }

    const classId = dto.classId ?? String(existing.classId);
    const courseId = dto.courseId ?? String(existing.courseId);

    if (dto.classId) {
      await this.lectureClassService.ensureExists(dto.classId);
    }
    if (dto.courseId) {
      await this.courseService.ensureExists(dto.courseId);
    }
    if (dto.semesterId) {
      await this.semesterService.ensureExists(dto.semesterId);
    }
    if (dto.lecturerId) {
      await this.ensureActiveUser(dto.lecturerId);
    }

    if (dto.classId ?? dto.courseId) {
      await this.assertMatchingDepartment(classId, courseId);
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

    const doc = await this.periodModel
      .findByIdAndUpdate(id, patch, { new: true })
      .exec();
    if (!doc) {
      throw new NotFoundException('Period not found');
    }
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.periodModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Period not found');
    }
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
    const lectureClass = await this.lectureClassService.findById(classId);
    const course = await this.courseService.findById(courseId);
    if (
      String(lectureClass.departmentId) !== String(course.departmentId)
    ) {
      throw new BadRequestException(
        'Course and class must belong to the same department',
      );
    }
  }
}
