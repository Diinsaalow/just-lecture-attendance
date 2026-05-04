import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

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

  async create(params: {
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
        passcodeHash,
        role: params.roleId,
        isActive: true,
      });
    } catch (err: unknown) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException('Username already taken');
      }
      throw err;
    }
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

  private isDuplicateKeyError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: number }).code === 11000
    );
  }
}
