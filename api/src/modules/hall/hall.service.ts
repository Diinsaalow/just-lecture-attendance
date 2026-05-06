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
import { CampusService } from '../campus/campus.service';
import { Hall, HallDocument } from './schemas/hall.schema';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@Injectable()
export class HallService {
  constructor(
    @InjectModel(Hall.name) private readonly hallModel: Model<HallDocument>,
    private readonly campusService: CampusService,
    private readonly userScopeService: UserScopeService,
  ) {}

  async create(
    dto: CreateHallDto,
    createdByUserId: string,
    user: AuthUserPayload,
  ): Promise<Hall> {
    await this.userScopeService.ensureCampusInScope(user, dto.campusId);
    await this.campusService.ensureExists(dto.campusId);
    return this.hallModel.create({
      name: dto.name,
      code: dto.code.trim(),
      campusId: new Types.ObjectId(dto.campusId),
      building: dto.building,
      floor: dto.floor,
      capacity: dto.capacity,
      status: dto.status,
      createdBy: new Types.ObjectId(createdByUserId),
    });
  }

  async findAllPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
  ): Promise<PaginatedResult<Hall>> {
    const baseMatch = await this.userScopeService.hallMatch(user);
    return paginateFind<HallDocument>(this.hallModel, q, {
      searchFields: ['name', 'code', 'building', 'floor', 'status'],
      defaultSort: { createdAt: -1 },
      baseMatch: Object.keys(baseMatch).length > 0 ? baseMatch : undefined,
      populate: [{ path: 'campusId', select: 'campusName' }],
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
    const baseMatch = await this.userScopeService.hallMatch(user);
    const filter: Record<string, unknown> = {
      _id: { $in: valid.map((id) => new Types.ObjectId(id)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const r = await this.hallModel.deleteMany(filter as never).exec();
    return { deletedCount: r.deletedCount ?? 0, message: 'Deleted' };
  }

  async findById(id: string, user: AuthUserPayload): Promise<Hall> {
    await this.userScopeService.ensureHallInScope(user, id);
    const doc = await this.findByIdOrNull(id);
    if (!doc) {
      throw new NotFoundException('Hall not found');
    }
    return doc;
  }

  async findByIdOrNull(id: string): Promise<Hall | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.hallModel
      .findById(id)
      .populate({ path: 'campusId', select: 'campusName' })
      .exec();
  }

  async findLeanCampusId(id: string): Promise<Types.ObjectId | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const row = await this.hallModel
      .findById(id)
      .select('campusId')
      .lean<{ campusId: Types.ObjectId } | null>();
    return row?.campusId ?? null;
  }

  async ensureExists(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid hall id');
    }
    const exists = await this.hallModel.exists({ _id: id });
    if (!exists) {
      throw new BadRequestException('Hall not found');
    }
  }

  async update(
    id: string,
    dto: UpdateHallDto,
    user: AuthUserPayload,
  ): Promise<Hall> {
    await this.userScopeService.ensureHallInScope(user, id);
    if (dto.campusId) {
      await this.userScopeService.ensureCampusInScope(user, dto.campusId);
      await this.campusService.ensureExists(dto.campusId);
    }
    const patch: Record<string, unknown> = { ...dto };
    if (dto.campusId) {
      patch.campusId = new Types.ObjectId(dto.campusId);
    }
    if (dto.code !== undefined) {
      patch.code = String(dto.code).trim();
    }
    const doc = await this.hallModel
      .findByIdAndUpdate(id, patch, { new: true })
      .populate({ path: 'campusId', select: 'campusName' })
      .exec();
    if (!doc) {
      throw new NotFoundException('Hall not found');
    }
    return doc;
  }

  async remove(id: string, user: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensureHallInScope(user, id);
    const doc = await this.hallModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException('Hall not found');
    }
  }
}
