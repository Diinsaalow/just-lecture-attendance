import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { UserRole } from '../../common/enums/user-role.enum';
import {
  defaultAbilitiesForRole,
  normalizeRoleName,
} from '../../common/casl/role-ability-templates';
import { PROTECTED_ROLE_NAMES } from './constants/protected-roles';
import { Role, RoleDocument } from './schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AbilityRuleDto } from './dto/ability-rule.dto';

type LeanRole = Record<string, unknown> & {
  _id: Types.ObjectId;
  name: string;
  ability?: unknown[];
  status?: string;
};

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultRoles();
    this.logger.log('Default roles and CASL abilities ensured');
  }

  async ensureDefaultRoles(): Promise<void> {
    const names = [
      UserRole.SUPER_ADMIN,
      UserRole.FACULTY_ADMIN,
      UserRole.INSTRUCTOR,
      UserRole.ADMIN,
      UserRole.LECTURE,
    ];
    for (const name of names) {
      const normalized = normalizeRoleName(name);
      const ability = defaultAbilitiesForRole(normalized);
      await this.roleModel.updateOne(
        { name },
        {
          $set: {
            name,
            ability,
            status: 'active',
          },
        },
        { upsert: true },
      );
    }
  }

  async findIdByRoleName(name: UserRole | string): Promise<Types.ObjectId> {
    const role = await this.roleModel.findOne({ name }).select('_id').lean();
    if (!role?._id) {
      throw new Error(`Role "${name}" not found — run ensureDefaultRoles first`);
    }
    return role._id;
  }

  async findRoleNameById(roleId: Types.ObjectId): Promise<string | null> {
    const role = await this.roleModel.findById(roleId).select('name').lean();
    return role?.name ?? null;
  }

  async findByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findAllPaginated(
    q: TableQueryDto,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const result = await paginateFind<RoleDocument>(this.roleModel, q, {
      searchFields: ['name'],
      defaultSort: { name: 1 },
    });
    return {
      ...result,
      docs: result.docs.map((d) => this.toResponse(d as unknown as LeanRole)),
    };
  }

  async findOneById(id: string): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Role not found');
    }
    const doc = await this.roleModel.findById(id).lean<LeanRole | null>();
    if (!doc) {
      throw new NotFoundException('Role not found');
    }
    return this.toResponse(doc);
  }

  async create(dto: CreateRoleDto): Promise<Record<string, unknown>> {
    const name = dto.name.trim().toLowerCase();
    if (PROTECTED_ROLE_NAMES.has(name)) {
      throw new ConflictException('This role name is reserved for system use');
    }
    const exists = await this.roleModel.exists({ name });
    if (exists) {
      throw new ConflictException('A role with this name already exists');
    }
    const ability = this.normalizeAbilityInput(dto.ability);
    const created = await this.roleModel.create({
      name,
      status: dto.status ?? 'active',
      ability,
    });
    return this.toResponse(created.toObject() as unknown as LeanRole);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Role not found');
    }
    const existing = await this.roleModel.findById(id).lean<LeanRole | null>();
    if (!existing) {
      throw new NotFoundException('Role not found');
    }
    const existingName = String(existing.name);
    if (PROTECTED_ROLE_NAMES.has(existingName)) {
      if (dto.name !== undefined && dto.name.trim().toLowerCase() !== existingName) {
        throw new ForbiddenException('System roles cannot be renamed');
      }
    }

    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim().toLowerCase();
      if (PROTECTED_ROLE_NAMES.has(name) && name !== existingName) {
        throw new ConflictException('This role name is reserved for system use');
      }
      const taken = await this.roleModel.findOne({
        name,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (taken) {
        throw new ConflictException('A role with this name already exists');
      }
      patch.name = name;
    }
    if (dto.status !== undefined) {
      patch.status = dto.status;
    }
    if (dto.ability !== undefined) {
      patch.ability = this.normalizeAbilityInput(dto.ability);
    }

    const updated = await this.roleModel
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .lean<LeanRole | null>();
    if (!updated) {
      throw new NotFoundException('Role not found');
    }
    return this.toResponse(updated);
  }

  async updatePermissions(
    id: string,
    ability: AbilityRuleDto[],
  ): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Role not found');
    }
    const existing = await this.roleModel.findById(id).lean<LeanRole | null>();
    if (!existing) {
      throw new NotFoundException('Role not found');
    }
    const normalized = this.normalizeAbilityInput(ability);
    const updated = await this.roleModel
      .findByIdAndUpdate(id, { $set: { ability: normalized } }, { new: true })
      .lean<LeanRole | null>();
    if (!updated) {
      throw new NotFoundException('Role not found');
    }
    return this.toResponse(updated);
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Role not found');
    }
    const doc = await this.roleModel.findById(id).lean<LeanRole | null>();
    if (!doc) {
      throw new NotFoundException('Role not found');
    }
    if (PROTECTED_ROLE_NAMES.has(String(doc.name))) {
      throw new ForbiddenException('System roles cannot be deleted');
    }
    const assigned = await this.userModel.exists({
      role: new Types.ObjectId(id),
    });
    if (assigned) {
      throw new ConflictException(
        'Cannot delete role while users are assigned to it',
      );
    }
    const res = await this.roleModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Role not found');
    }
  }

  async bulkRemove(ids: string[]): Promise<{ deletedCount: number }> {
    const valid = ids.filter((i) => Types.ObjectId.isValid(i));
    let deleted = 0;
    for (const id of valid) {
      try {
        await this.remove(id);
        deleted += 1;
      } catch {
        /* skip non-deletable or missing */
      }
    }
    return { deletedCount: deleted };
  }

  private normalizeAbilityInput(
    rules?: AbilityRuleDto[] | null,
  ): Array<{
    action: string | string[];
    subject: string;
    fields?: string[];
    condition?: Record<string, unknown>;
  }> {
    if (!rules?.length) {
      return [];
    }
    const out: Array<{
      action: string | string[];
      subject: string;
      fields?: string[];
      condition?: Record<string, unknown>;
    }> = [];
    for (const r of rules) {
      if (!r.subject?.trim()) {
        throw new BadRequestException('Each ability rule must include a subject');
      }
      const action = r.action;
      if (
        action === undefined ||
        action === null ||
        (Array.isArray(action) && action.length === 0) ||
        (typeof action === 'string' && !action.trim())
      ) {
        throw new BadRequestException(
          `Missing action for subject "${r.subject}"`,
        );
      }
      out.push({
        action,
        subject: r.subject.trim(),
        ...(r.fields?.length ? { fields: r.fields } : {}),
        ...(r.condition && Object.keys(r.condition).length
          ? { condition: r.condition }
          : {}),
      });
    }
    return out;
  }

  private toResponse(
    doc: LeanRole | RoleDocument,
  ): Record<string, unknown> {
    const plain: LeanRole =
      typeof (doc as RoleDocument).toObject === 'function'
        ? (((doc as RoleDocument).toObject() as unknown) as LeanRole)
        : { ...(doc as LeanRole) };
    const name = String(plain.name ?? '');
    return {
      ...plain,
      _id: String(plain._id),
      isDeletable: !PROTECTED_ROLE_NAMES.has(name),
    };
  }
}
