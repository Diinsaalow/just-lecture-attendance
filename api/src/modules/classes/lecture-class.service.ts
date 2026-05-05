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
    private readonly userScopeService: UserScopeService,
  ) {}

  async create(
    dto: CreateLectureClassDto,
    createdByUserId: string,
    user: AuthUserPayload,
  ): Promise<LectureClass> {
    await this.userScopeService.ensureDepartmentInScope(user, dto.departmentId);
    await this.userScopeService.ensureCampusInScope(user, dto.campusId);
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
    user: AuthUserPayload,
  ): Promise<PaginatedResult<LectureClass>> {
    const baseMatch = await this.userScopeService.lectureClassMatch(user);
    return paginateFind<LectureClassDocument>(this.lectureClassModel, q, {
      searchFields: ['name', 'mode', 'shift', 'batchId', 'status'],
      defaultSort: { createdAt: -1 },
      populate: [
        { path: 'departmentId', select: 'name' },
        { path: 'campusId', select: 'campusName' },
        { path: 'academicYearId', select: 'name' },
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
    const baseMatch = await this.userScopeService.lectureClassMatch(user);
    const filter: Record<string, unknown> = {
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const r = await this.lectureClassModel.deleteMany(filter as never).exec();
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string, user: AuthUserPayload): Promise<LectureClass> {
    await this.userScopeService.ensureLectureClassInScope(user, id);
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
    user: AuthUserPayload,
  ): Promise<LectureClass> {
    await this.userScopeService.ensureLectureClassInScope(user, id);
    if (dto.departmentId) {
      await this.userScopeService.ensureDepartmentInScope(user, dto.departmentId);
      await this.departmentService.ensureExists(dto.departmentId);
    }
    if (dto.campusId) {
      await this.userScopeService.ensureCampusInScope(user, dto.campusId);
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

  async remove(id: string, user: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensureLectureClassInScope(user, id);
    const doc = await this.lectureClassModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Class not found');
    }
  }
}
