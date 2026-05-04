import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async findAll(): Promise<AcademicYear[]> {
    return this.academicYearModel.find().sort({ startDate: -1 }).exec();
  }

  async findById(id: string): Promise<AcademicYear> {
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

  async update(id: string, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
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

  async remove(id: string): Promise<void> {
    const doc = await this.academicYearModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Academic year not found');
    }
  }
}
