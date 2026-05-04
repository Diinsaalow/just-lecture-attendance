import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campus, CampusDocument } from './schemas/campus.schema';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

@Injectable()
export class CampusService {
  constructor(
    @InjectModel(Campus.name) private readonly campusModel: Model<CampusDocument>,
  ) {}

  async create(dto: CreateCampusDto, createdByUserId: string): Promise<Campus> {
    return this.campusModel.create({
      ...dto,
      status: dto.status ?? undefined,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAll(): Promise<Campus[]> {
    return this.campusModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Campus> {
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Campus not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<Campus | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.campusModel.findById(id).exec();
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid campus id');
    }
    const exists = await this.campusModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Campus not found');
    }
  }

  async update(id: string, dto: UpdateCampusDto): Promise<Campus> {
    const doc = await this.campusModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!doc) {
      throw new NotFoundException('Campus not found');
    }
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.campusModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Campus not found');
    }
  }
}
