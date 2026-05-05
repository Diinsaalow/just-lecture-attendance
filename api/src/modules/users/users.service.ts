import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { normalizeRoleName } from '../../common/casl/role-ability-templates';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { UserRole } from '../../common/enums/user-role.enum';
import type { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { User, UserDocument } from './schemas/user.schema';
import { RolesService } from '../roles/roles.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const BCRYPT_ROUNDS = 10;

function mergeAnd(
  ...parts: (Record<string, unknown> | undefined)[]
): Record<string, unknown> | undefined {
  const defined = parts.filter((p): p is Record<string, unknown> =>
    Boolean(p && Object.keys(p).length > 0),
  );
  if (defined.length === 0) return undefined;
  if (defined.length === 1) return defined[0];
  return { $and: defined };
}

export type SafeUser = AuthUserPayload;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly userScopeService: UserScopeService,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const username = dto.email.trim().toLowerCase();
    const exists = await this.userModel.exists({ username });
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }
    const passcodeHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    return await this.userModel.create({
      username,
      email: username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      passcodeHash,
      role: new Types.ObjectId(dto.role),
      status: dto.status || 'active',
      isActive: dto.status !== 'inactive',
    });
  }

  /** Public self-registration / auth (username + numeric passcode); separate from admin CreateUserDto. */
  async registerWithPasscode(params: {
    username: string;
    passcode: string;
    roleId: Types.ObjectId;
  }): Promise<UserDocument> {
    const normalized = params.username.trim().toLowerCase();
    const exists = await this.userModel.exists({ username: normalized });
    if (exists) {
      throw new ConflictException('Username already taken');
    }
    const passcodeHash = await bcrypt.hash(params.passcode, BCRYPT_ROUNDS);
    try {
      return await this.userModel.create({
        username: normalized,
        email: normalized,
        passcodeHash,
        role: params.roleId,
        status: 'active',
        isActive: true,
      });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException('Username already taken');
      }
      throw err;
    }
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actor: AuthUserPayload,
  ): Promise<UserDocument> {
    await this.userScopeService.ensureUserInScope(actor, id);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = { ...dto };

    if (dto.email) {
      const username = dto.email.trim().toLowerCase();
      const exists = await this.userModel.findOne({
        username,
        _id: { $ne: id },
      });
      if (exists) {
        throw new ConflictException('User with this email already exists');
      }
      updateData.username = username;
      updateData.email = username;
    }

    if (dto.password) {
      updateData.passcodeHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      delete updateData.password;
    }

    if (dto.role) {
      updateData.role = new Types.ObjectId(dto.role);
    }

    if (dto.status) {
      updateData.isActive = dto.status !== 'inactive';
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async remove(id: string, actor: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensureUserInScope(actor, id);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async bulkRemove(
    ids: string[],
    actor: AuthUserPayload,
  ): Promise<{ deletedCount: number }> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const baseMatch = await this.userScopeService.userMatch(actor);
    const filter: Record<string, unknown> = {
      _id: { $in: validIds.map((i) => new Types.ObjectId(i)) },
    };
    if (Object.keys(baseMatch).length > 0) {
      Object.assign(filter, baseMatch);
    }
    const result = await this.userModel.deleteMany(filter as never).exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  async findByUsernameWithHash(username: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ username: username.trim().toLowerCase() })
      .exec();
  }

  async findActiveByIdForAuth(id: string): Promise<SafeUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    type LeanUser = {
      _id: Types.ObjectId;
      username: string;
      isActive: boolean;
      facultyId?: Types.ObjectId;
      role: { name: string; ability?: AuthUserPayload['role']['ability'] };
    };

    const row = await this.userModel
      .findOne({ _id: id, isActive: true })
      .populate<{
        name: string;
        ability?: AuthUserPayload['role']['ability'];
      }>('role', 'name ability')
      .lean<LeanUser | null>();

    if (!row?.role?.name) {
      return null;
    }

    return {
      id: String(row._id),
      username: row.username,
      isActive: row.isActive,
      facultyId: row.facultyId ? String(row.facultyId) : undefined,
      role: {
        name: row.role.name,
        ability: row.role.ability,
      },
    };
  }

  async verifyPasscode(plain: string, passcodeHash: string): Promise<boolean> {
    return bcrypt.compare(plain, passcodeHash);
  }

  async findAllPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
    opts?: { excludeInstructorRole?: boolean },
  ): Promise<PaginatedResult<UserDocument>> {
    const baseMatch = await this.userScopeService.userMatch(user);
    let extra: Record<string, unknown> | undefined;
    if (opts?.excludeInstructorRole) {
      const instructorRoleId = await this.rolesService.findIdByRoleName(
        UserRole.INSTRUCTOR,
      );
      extra = { role: { $ne: instructorRoleId } };
    }
    const merged = mergeAnd(baseMatch, extra);
    return paginateFind<UserDocument>(this.userModel, q, {
      searchFields: ['username', 'firstName', 'lastName', 'email'],
      defaultSort: { createdAt: -1 },
      populate: { path: 'role', select: 'name' },
      baseMatch: merged && Object.keys(merged).length > 0 ? merged : undefined,
    });
  }

  /** Jamhuriya instructor login id: `j` + YY + sequence (e.g. j2601). Stored lowercase. */
  async generateNextLecturerUsername(): Promise<string> {
    const yy = String(new Date().getFullYear()).slice(-2);
    const prefix = `j${yy}`;
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${escaped}(\\d+)$`, 'i');
    const docs = await this.userModel
      .find({ username: new RegExp(`^${escaped}\\d+$`, 'i') })
      .select('username')
      .lean<{ username: string }[]>();
    let max = 0;
    for (const d of docs) {
      const m = d.username.match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    const next = max + 1;
    const seq = next < 100 ? String(next).padStart(2, '0') : String(next);
    return `${prefix}${seq}`;
  }

  async createLecturer(
    dto: CreateLecturerDto,
    actor: AuthUserPayload,
  ): Promise<UserDocument> {
    const instructorRoleId = await this.rolesService.findIdByRoleName(
      UserRole.INSTRUCTOR,
    );

    let facultyId: Types.ObjectId | undefined;
    if (this.userScopeService.isSuperAdmin(actor)) {
      if (dto.facultyId) {
        facultyId = new Types.ObjectId(dto.facultyId);
      }
    } else if (this.userScopeService.isFacultyAdmin(actor)) {
      if (!actor.facultyId) {
        throw new ForbiddenException('Faculty admin has no faculty scope');
      }
      facultyId = new Types.ObjectId(actor.facultyId);
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }

    const username = await this.generateNextLecturerUsername();
    const passcodeHash = await bcrypt.hash(dto.passcode, BCRYPT_ROUNDS);

    try {
      return await this.userModel.create({
        username,
        email: username,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone?.trim(),
        passcodeHash,
        role: instructorRoleId,
        facultyId,
        status: dto.status ?? 'active',
        isActive: (dto.status ?? 'active') !== 'inactive',
      });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException('Username conflict — retry');
      }
      throw err;
    }
  }

  async findAllLecturersPaginated(
    q: TableQueryDto,
    user: AuthUserPayload,
  ): Promise<PaginatedResult<UserDocument>> {
    const instructorRoleId = await this.rolesService.findIdByRoleName(
      UserRole.INSTRUCTOR,
    );
    const scopeMatch = await this.userScopeService.userMatch(user);
    const roleMatch = { role: instructorRoleId };
    const merged = mergeAnd(scopeMatch, roleMatch);
    return paginateFind<UserDocument>(this.userModel, q, {
      searchFields: ['username', 'firstName', 'lastName', 'email', 'phone'],
      defaultSort: { createdAt: -1 },
      populate: [
        { path: 'role', select: 'name' },
        { path: 'facultyId', select: 'name' },
      ],
      baseMatch: merged,
    });
  }

  async findLecturerByIdSafe(id: string, actor: AuthUserPayload) {
    await this.userScopeService.ensureUserInScope(actor, id);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Lecturer not found');
    }
    const doc = await this.userModel
      .findById(id)
      .select('-passcodeHash')
      .populate('role', 'name')
      .populate('facultyId', 'name')
      .lean();
    if (!doc) {
      throw new NotFoundException('Lecturer not found');
    }
    const roleName =
      typeof doc.role === 'object' && doc.role !== null && 'name' in doc.role
        ? (doc.role as { name: string }).name
        : '';
    if (normalizeRoleName(roleName) !== 'instructor') {
      throw new NotFoundException('Lecturer not found');
    }
    return doc;
  }

  async updateLecturer(
    id: string,
    dto: UpdateLecturerDto,
    actor: AuthUserPayload,
  ): Promise<UserDocument> {
    await this.userScopeService.ensureUserInScope(actor, id);
    const existing = await this.userModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Lecturer not found');
    }
    await this.assertIsInstructorUser(existing);

    const patch: Record<string, unknown> = {};
    if (dto.firstName !== undefined) {
      patch.firstName = dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      patch.lastName = dto.lastName.trim();
    }
    if (dto.phone !== undefined) {
      patch.phone = dto.phone?.trim();
    }
    if (dto.passcode) {
      patch.passcodeHash = await bcrypt.hash(dto.passcode, BCRYPT_ROUNDS);
    }
    if (dto.status !== undefined) {
      patch.status = dto.status;
      patch.isActive = dto.status !== 'inactive';
    }
    if (
      dto.facultyId !== undefined &&
      this.userScopeService.isSuperAdmin(actor)
    ) {
      patch.facultyId = new Types.ObjectId(dto.facultyId);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, patch, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Lecturer not found');
    }
    return updated;
  }

  async removeLecturer(id: string, actor: AuthUserPayload): Promise<void> {
    await this.userScopeService.ensureUserInScope(actor, id);
    const existing = await this.userModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Lecturer not found');
    }
    await this.assertIsInstructorUser(existing);
    await this.userModel.findByIdAndDelete(id).exec();
  }

  async bulkRemoveLecturers(
    ids: string[],
    actor: AuthUserPayload,
  ): Promise<{ deletedCount: number }> {
    const instructorRoleId = await this.rolesService.findIdByRoleName(
      UserRole.INSTRUCTOR,
    );
    const validIds = ids.filter((i) => Types.ObjectId.isValid(i));
    if (!validIds.length) {
      return { deletedCount: 0 };
    }
    const scopeMatch = await this.userScopeService.userMatch(actor);
    const filter: Record<string, unknown> = {
      _id: { $in: validIds.map((i) => new Types.ObjectId(i)) },
      role: instructorRoleId,
    };
    const merged = mergeAnd(scopeMatch, filter);
    const result = await this.userModel
      .deleteMany((merged ?? filter) as never)
      .exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  private async assertIsInstructorUser(doc: UserDocument): Promise<void> {
    const instructorRoleId = await this.rolesService.findIdByRoleName(
      UserRole.INSTRUCTOR,
    );
    const rid =
      doc.role instanceof Types.ObjectId
        ? doc.role.toString()
        : String(
            (doc.role as { _id?: Types.ObjectId })._id ??
              (doc.role as Types.ObjectId),
          );
    if (rid !== instructorRoleId.toString()) {
      throw new NotFoundException('Lecturer not found');
    }
  }

  async findByIdSafe(id: string, user: AuthUserPayload) {
    await this.userScopeService.ensureUserInScope(user, id);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }
    const doc = await this.userModel
      .findById(id)
      .select('-passcodeHash')
      .populate('role', 'name')
      .lean();
    if (!doc) {
      throw new NotFoundException('User not found');
    }
    return doc;
  }
}
