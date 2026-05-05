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
import { CampusService } from '../campus/campus.service';
import { Faculty, FacultyDocument } from './schemas/faculty.schema';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
    private readonly campusService: CampusService,
  ) {}

  async create(dto: CreateFacultyDto, createdByUserId: string): Promise<Faculty> {
    await this.campusService.ensureExists(dto.campusId);
    return this.facultyModel.create({
      name: dto.name,
      description: dto.description,
      code: dto.code,
      campusId: new Types.ObjectId(dto.campusId),
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(q: TableQueryDto): Promise<PaginatedResult<Faculty>> {
    return paginateFind<FacultyDocument>(this.facultyModel, q, {
      searchFields: ['name', 'description', 'code', 'status'],
      defaultSort: { createdAt: -1 },
      populate: { path: 'campusId', select: 'campusName' },
    });
  }

  async bulkRemove(
    ids: string[],
  ): Promise<{ deletedCount: number; message: string }> {
    const valid = ids.filter((id) => Types.ObjectId.isValid(id));
    if (!valid.length) {
      return { deletedCount: 0, message: 'No valid ids' };
    }
    const r = await this.facultyModel.deleteMany({ _id: { $in: valid } });
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string): Promise<Faculty> {
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Faculty not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<Faculty | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.facultyModel.findById(id).exec();
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid faculty id');
    }
    const exists = await this.facultyModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Faculty not found');
    }
  }

  async update(id: string, dto: UpdateFacultyDto): Promise<Faculty> {
    if (dto.campusId) {
      await this.campusService.ensureExists(dto.campusId);
    }
    const doc = await this.facultyModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          ...(dto.campusId && { campusId: new Types.ObjectId(dto.campusId) }),
        },
        { new: true },
      )
      .exec();
    if (!doc) {
      throw new NotFoundException('Faculty not found');
    }
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.facultyModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Faculty not found');
    }
  }
}
