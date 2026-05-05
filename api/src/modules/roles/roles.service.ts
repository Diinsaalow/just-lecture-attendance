import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { UserRole } from '../../common/enums/user-role.enum';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultRoles();
    this.logger.log('Default roles ensured (lecture, admin)');
  }

  async ensureDefaultRoles(): Promise<void> {
    for (const name of Object.values(UserRole)) {
      await this.roleModel.updateOne(
        { name },
        { $setOnInsert: { name } },
        { upsert: true },
      );
    }
  }

  async findIdByRoleName(name: UserRole): Promise<Types.ObjectId> {
    const role = await this.roleModel.findOne({ name }).select('_id').lean();
    if (!role?._id) {
      throw new Error(
        `Role "${name}" not found — run ensureDefaultRoles first`,
      );
    }
    return role._id;
  }

  async findRoleNameById(roleId: Types.ObjectId): Promise<UserRole | null> {
    const role = await this.roleModel.findById(roleId).select('name').lean();
    const name = role?.name;
    if (name === UserRole.ADMIN || name === UserRole.LECTURE) {
      return name;
    }
    return null;
  }

  async findAllPaginated(
    q: TableQueryDto,
  ): Promise<PaginatedResult<RoleDocument>> {
    return paginateFind<RoleDocument>(this.roleModel, q, {
      searchFields: ['name'],
      defaultSort: { name: 1 },
    });
  }
}
