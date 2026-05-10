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
import { Semester, SemesterDocument } from './schemas/semester.schema';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemesterService {
  constructor(
    @InjectModel(Semester.name)
    private readonly semesterModel: Model<SemesterDocument>,
    private readonly academicYearService: AcademicYearService,
    private readonly userScopeService: UserScopeService,
  ) {}

  async create(
    dto: CreateSemesterDto,
    createdByUserId: string,
  ): Promise<Semester> {
    await this.academicYearService.ensureExists(dto.academicYearId);
    const year = await this.academicYearService.findByIdOrNull(
      dto.academicYearId,
    );
    if (!year) {
      throw new BadRequestException('Academic year not found');
    }
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) {
      throw new BadRequestException('endDate must be after startDate');
    }
    if (start < year.startDate || end > year.endDate) {
      throw new BadRequestException(
        'Semester dates must fall within the academic year range',
      );
    }

    return this.semesterModel.create({
      name: dto.name,
      startDate: start,
      endDate: end,
      academicYearId: new Types.ObjectId(dto.academicYearId),
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
  ): Promise<PaginatedResult<Semester>> {
    const baseMatch = await this.userScopeService.semesterMatch(user);
    return paginateFind<SemesterDocument>(this.semesterModel, q, {
      searchFields: ['name', 'status'],
      defaultSort: { startDate: -1 },
      populate: { path: 'academicYearId', select: 'name' },
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
    const baseMatch = await this.userScopeService.semesterMatch(user);
    const filter: Record<string, unknown> = {
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const r = await this.semesterModel.deleteMany(filter as never).exec();
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string, user: AuthUserPayload): Promise<Semester> {
    await this.userScopeService.ensureSemesterInScope(user, id);
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Semester not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<Semester | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.semesterModel.findById(id).exec();
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid semester id');
    }
    const exists = await this.semesterModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Semester not found');
    }
  }

  async update(
    id: string,
    dto: UpdateSemesterDto,
    user: AuthUserPayload,
  ): Promise<Semester> {
    await this.userScopeService.ensureSemesterInScope(user, id);
    const existing = await this.findByIdOrNull(id);
    if (!existing) {
      throw new NotFoundException('Semester not found');
    }

    let academicYearId = existing.academicYearId;
    if (dto.academicYearId) {
      await this.academicYearService.ensureExists(dto.academicYearId);
      academicYearId = new Types.ObjectId(dto.academicYearId);
    }

    const year = await this.academicYearService.findByIdOrNull(
      String(academicYearId),
    );
    if (!year) {
      throw new BadRequestException('Academic year not found');
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
    if (start < year.startDate || end > year.endDate) {
      throw new BadRequestException(
        'Semester dates must fall within the academic year range',
      );
    }

    const doc = await this.semesterModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          startDate: dto.startDate !== undefined ? start : undefined,
          endDate: dto.endDate !== undefined ? end : undefined,
          ...(dto.academicYearId && {
            academicYearId: new Types.ObjectId(dto.academicYearId),
          }),
        },
        { new: true },
      )
      .exec();
    if (!doc) {
      throw new NotFoundException('Semester not found');
    }
    return doc;
  }

  async remove(id: string, user: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensureSemesterInScope(user, id);
    const doc = await this.semesterModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Semester not found');
    }
  }
}
