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
import { FacultyService } from '../faculty/faculty.service';
import {
  Department,
  DepartmentDocument,
} from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    private readonly facultyService: FacultyService,
    private readonly userScopeService: UserScopeService,
  ) {}

  async create(
    dto: CreateDepartmentDto,
    createdByUserId: string,
    user: AuthUserPayload,
  ): Promise<Department> {
    await this.userScopeService.ensureFacultyInScope(user, dto.facultyId);
    await this.facultyService.ensureExists(dto.facultyId);
    return this.departmentModel.create({
      name: dto.name,
      graduationName: dto.graduationName,
      facultyId: new Types.ObjectId(dto.facultyId),
      duration: dto.duration,
      abbreviation: dto.abbreviation,
      degree: dto.degree,
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
  ): Promise<PaginatedResult<Department>> {
    const baseMatch = await this.userScopeService.departmentMatch(user);
    return paginateFind<DepartmentDocument>(this.departmentModel, q, {
      searchFields: [
        'name',
        'graduationName',
        'duration',
        'abbreviation',
        'degree',
        'status',
      ],
      defaultSort: { createdAt: -1 },
      populate: { path: 'facultyId', select: 'name' },
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
    const baseMatch = await this.userScopeService.departmentMatch(user);
    const filter: Record<string, unknown> = {
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const r = await this.departmentModel.deleteMany(filter as never).exec();
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string, user: AuthUserPayload): Promise<Department> {
    await this.userScopeService.ensureDepartmentInScope(user, id);
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Department not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<Department | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.departmentModel.findById(id).exec();
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department id');
    }
    const exists = await this.departmentModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Department not found');
    }
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
    user: AuthUserPayload,
  ): Promise<Department> {
    await this.userScopeService.ensureDepartmentInScope(user, id);
    if (dto.facultyId) {
      await this.userScopeService.ensureFacultyInScope(user, dto.facultyId);
      await this.facultyService.ensureExists(dto.facultyId);
    }
    const doc = await this.departmentModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          ...(dto.facultyId && {
            facultyId: new Types.ObjectId(dto.facultyId),
          }),
        },
        { new: true },
      )
      .exec();
    if (!doc) {
      throw new NotFoundException('Department not found');
    }
    return doc;
  }

  async remove(id: string, user: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensureDepartmentInScope(user, id);
    const doc = await this.departmentModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Department not found');
    }
  }
}
