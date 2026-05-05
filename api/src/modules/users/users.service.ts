import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const BCRYPT_ROUNDS = 10;

export type SafeUser = {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = { ...dto };
    
    if (dto.email) {
      const username = dto.email.trim().toLowerCase();
      const exists = await this.userModel.findOne({ username, _id: { $ne: id } });
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

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async bulkRemove(ids: string[]): Promise<{ deletedCount: number }> {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id));
    const result = await this.userModel.deleteMany({ _id: { $in: validIds } }).exec();
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
      role: { name: string };
    };

    const row = await this.userModel
      .findOne({ _id: id, isActive: true })
      .populate<{ name: string }>('role', 'name')
      .lean<LeanUser | null>();

    if (!row?.role?.name) {
      return null;
    }

    return {
      id: String(row._id),
      username: row.username,
      role: row.role.name,
      isActive: row.isActive,
    };
  }

  async verifyPasscode(plain: string, passcodeHash: string): Promise<boolean> {
    return bcrypt.compare(plain, passcodeHash);
  }

  async findAllPaginated(
    q: TableQueryDto,
  ): Promise<PaginatedResult<UserDocument>> {
    return paginateFind<UserDocument>(this.userModel, q, {
      searchFields: ['username', 'firstName', 'lastName', 'email'],
      defaultSort: { createdAt: -1 },
      populate: { path: 'role', select: 'name' },
    });
  }

  async findByIdSafe(id: string) {
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
