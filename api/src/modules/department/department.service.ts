import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  ) {}

  async create(
    dto: CreateDepartmentDto,
    createdByUserId: string,
  ): Promise<Department> {
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

  async findAll(): Promise<Department[]> {
    return this.departmentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Department> {
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

  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    if (dto.facultyId) {
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

  async remove(id: string): Promise<void> {
    const doc = await this.departmentModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Department not found');
    }
  }
}
