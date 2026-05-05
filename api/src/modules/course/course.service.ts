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
import { DepartmentService } from '../department/department.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly departmentService: DepartmentService,
  ) {}

  async create(dto: CreateCourseDto, createdByUserId: string): Promise<Course> {
    await this.departmentService.ensureExists(dto.departmentId);
    const lecturerIds = await this.normalizeLecturerIds(dto.lecturers);

    return this.courseModel.create({
      name: dto.name,
      departmentId: new Types.ObjectId(dto.departmentId),
      type: dto.type,
      credit: dto.credit,
      lecturers: lecturerIds,
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(q: TableQueryDto): Promise<PaginatedResult<Course>> {
    return paginateFind<CourseDocument>(this.courseModel, q, {
      searchFields: ['name', 'type', 'status'],
      defaultSort: { createdAt: -1 },
      populate: { path: 'departmentId', select: 'name' },
    });
  }

  async bulkRemove(
    ids: string[],
  ): Promise<{ deletedCount: number; message: string }> {
    const valid = ids.filter((id) => Types.ObjectId.isValid(id));
    if (!valid.length) {
      return { deletedCount: 0, message: 'No valid ids' };
    }
    const r = await this.courseModel.deleteMany({ _id: { $in: valid } });
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string): Promise<Course> {
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Course not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<Course | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.courseModel.findById(id).exec();
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course id');
    }
    const exists = await this.courseModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Course not found');
    }
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    if (dto.departmentId) {
      await this.departmentService.ensureExists(dto.departmentId);
    }
    let lecturerIds: Types.ObjectId[] | undefined;
    if (dto.lecturers !== undefined) {
      lecturerIds = await this.normalizeLecturerIds(dto.lecturers);
    }
    const doc = await this.courseModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          ...(dto.departmentId && {
            departmentId: new Types.ObjectId(dto.departmentId),
          }),
          ...(lecturerIds !== undefined && { lecturers: lecturerIds }),
        },
        { new: true },
      )
      .exec();
    if (!doc) {
      throw new NotFoundException('Course not found');
    }
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.courseModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Course not found');
    }
  }

  private async normalizeLecturerIds(
    ids: string[] | undefined,
  ): Promise<Types.ObjectId[]> {
    if (!ids?.length) {
      return [];
    }
    const unique = [...new Set(ids)];
    for (const lid of unique) {
      if (!Types.ObjectId.isValid(lid)) {
        throw new BadRequestException(`Invalid lecturer id: ${lid}`);
      }
      const exists = await this.userModel.exists({ _id: lid, isActive: true });
      if (!exists) {
        throw new BadRequestException(`Lecturer user not found: ${lid}`);
      }
    }
    return unique.map((x) => new Types.ObjectId(x));
  }
}
