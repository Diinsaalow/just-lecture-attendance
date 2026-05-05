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
import { AcademicYearService } from '../academic-year/academic-year.service';
import { CampusService } from '../campus/campus.service';
import { DepartmentService } from '../department/department.service';
import {
  LectureClass,
  LectureClassDocument,
} from './schemas/lecture-class.schema';
import { CreateLectureClassDto } from './dto/create-lecture-class.dto';
import { UpdateLectureClassDto } from './dto/update-lecture-class.dto';

@Injectable()
export class LectureClassService {
  constructor(
    @InjectModel(LectureClass.name)
    private readonly lectureClassModel: Model<LectureClassDocument>,
    private readonly departmentService: DepartmentService,
    private readonly campusService: CampusService,
    private readonly academicYearService: AcademicYearService,
  ) {}

  async create(
    dto: CreateLectureClassDto,
    createdByUserId: string,
  ): Promise<LectureClass> {
    await this.departmentService.ensureExists(dto.departmentId);
    await this.campusService.ensureExists(dto.campusId);
    await this.academicYearService.ensureExists(dto.academicYearId);

    return this.lectureClassModel.create({
      name: dto.name,
      departmentId: new Types.ObjectId(dto.departmentId),
      mode: dto.mode,
      shift: dto.shift,
      size: dto.size,
      campusId: new Types.ObjectId(dto.campusId),
      batchId: dto.batchId,
      academicYearId: new Types.ObjectId(dto.academicYearId),
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(
    q: TableQueryDto,
  ): Promise<PaginatedResult<LectureClass>> {
    return paginateFind<LectureClassDocument>(this.lectureClassModel, q, {
      searchFields: ['name', 'mode', 'shift', 'batchId', 'status'],
      defaultSort: { createdAt: -1 },
      populate: [
        { path: 'departmentId', select: 'name' },
        { path: 'campusId', select: 'campusName' },
        { path: 'academicYearId', select: 'name' },
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
    const r = await this.lectureClassModel.deleteMany({
      _id: { $in: valid },
    });
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string): Promise<LectureClass> {
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Class not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<LectureClass | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.lectureClassModel.findById(id).exec();
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid class id');
    }
    const exists = await this.lectureClassModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Class not found');
    }
  }

  async update(
    id: string,
    dto: UpdateLectureClassDto,
  ): Promise<LectureClass> {
    if (dto.departmentId) {
      await this.departmentService.ensureExists(dto.departmentId);
    }
    if (dto.campusId) {
      await this.campusService.ensureExists(dto.campusId);
    }
    if (dto.academicYearId) {
      await this.academicYearService.ensureExists(dto.academicYearId);
    }

    const doc = await this.lectureClassModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          ...(dto.departmentId && {
            departmentId: new Types.ObjectId(dto.departmentId),
          }),
          ...(dto.campusId && { campusId: new Types.ObjectId(dto.campusId) }),
          ...(dto.academicYearId && {
            academicYearId: new Types.ObjectId(dto.academicYearId),
          }),
        },
        { new: true },
      )
      .exec();
    if (!doc) {
      throw new NotFoundException('Class not found');
    }
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.lectureClassModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Class not found');
    }
  }
}
