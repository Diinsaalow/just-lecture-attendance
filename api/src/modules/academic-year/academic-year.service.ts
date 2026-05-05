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
import {
  AcademicYear,
  AcademicYearDocument,
} from './schemas/academic-year.schema';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectModel(AcademicYear.name)
    private readonly academicYearModel: Model<AcademicYearDocument>,
    private readonly userScopeService: UserScopeService,
  ) {}

  async create(
    dto: CreateAcademicYearDto,
    createdByUserId: string,
  ): Promise<AcademicYear> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) {
      throw new BadRequestException('endDate must be after startDate');
    }
    return this.academicYearModel.create({
      name: dto.name,
      startDate: start,
      endDate: end,
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
  ): Promise<PaginatedResult<AcademicYear>> {
    const baseMatch = await this.userScopeService.academicYearMatch(user);
    return paginateFind<AcademicYearDocument>(this.academicYearModel, q, {
      searchFields: ['name', 'status'],
      defaultSort: { startDate: -1 },
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
    const baseMatch = await this.userScopeService.academicYearMatch(user);
    const filter: Record<string, unknown> = {
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const r = await this.academicYearModel.deleteMany(filter as never).exec();
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string, _user: AuthUserPayload): Promise<AcademicYear> {
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Academic year not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<AcademicYear | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.academicYearModel.findById(id).exec();
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid academic year id');
    }
    const exists = await this.academicYearModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Academic year not found');
    }
  }

  async update(
    id: string,
    dto: UpdateAcademicYearDto,
    _user: AuthUserPayload,
  ): Promise<AcademicYear> {
    const existing = await this.findByIdOrNull(id);
    if (!existing) {
      throw new NotFoundException('Academic year not found');
    }
    const start =
      dto.startDate !== undefined
        ? new Date(dto.startDate)
        : existing.startDate;
    const end =
      dto.endDate !== undefined ? new Date(dto.endDate) : existing.endDate;
    if (end <= start) {
      throw new BadRequestException('endDate must be after startDate');
    }
    const doc = await this.academicYearModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          startDate: dto.startDate !== undefined ? start : undefined,
          endDate: dto.endDate !== undefined ? end : undefined,
        },
        { new: true },
      )
      .exec();
    if (!doc) {
      throw new NotFoundException('Academic year not found');
    }
    return doc;
  }

  async remove(id: string, _user: AuthUserPayload): Promise<void> {
    const doc = await this.academicYearModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Academic year not found');
    }
  }
}
