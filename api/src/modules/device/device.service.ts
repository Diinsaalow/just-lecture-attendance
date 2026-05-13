import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UserScopeService } from '../../common/casl/user-scope.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction, AuditEntity } from '../audit-log/enums/audit-action.enum';
import { TableQueryDto } from '../../common/dto/table-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { paginateFind } from '../../common/utils/mongo-table-query';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly auditLog: AuditLogService,
    private readonly userScopeService: UserScopeService,
  ) {}

  /**
   * Request device registration for the authenticated instructor.
   * This sets a pending request that must be approved by an admin.
   */
  async register(
    userId: string,
    dto: RegisterDeviceDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Check if another instructor already has this device registered
    const conflict = await this.userModel.findOne({
      $or: [
        { registeredDeviceId: dto.deviceId },
        { pendingDeviceId: dto.deviceId },
      ],
      _id: { $ne: userId },
    });

    if (conflict) {
      throw new ConflictException(
        'This device is already associated with another instructor.',
      );
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        pendingDeviceId: dto.deviceId,
        deviceModel: dto.deviceModel,
        devicePlatform: dto.devicePlatform,
      },
    });

    await this.auditLog.record({
      action: AuditAction.DEVICE_REGISTER,
      entityType: AuditEntity.DEVICE,
      entityId: userId,
      facultyId: user.facultyId,
      after: { deviceId: dto.deviceId, model: dto.deviceModel },
    });

    return {
      message: 'Registration request sent. Please wait for admin approval.',
    };
  }

  async approveDevice(
    userId: string,
    actorId: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.pendingDeviceId) {
      throw new BadRequestException(
        'No pending device request found for this user.',
      );
    }

    const before = user.registeredDeviceId;
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { registeredDeviceId: user.pendingDeviceId },
      $unset: { pendingDeviceId: '' },
    });

    await this.auditLog.record({
      action: AuditAction.DEVICE_APPROVE,
      entityType: AuditEntity.DEVICE,
      entityId: userId,
      facultyId: user.facultyId,
      before: before ? { deviceId: before } : null,
      after: { deviceId: user.pendingDeviceId },
    });

    return { message: 'Device approved successfully' };
  }

  async rejectDevice(
    userId: string,
    actorId: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.pendingDeviceId) {
      throw new BadRequestException(
        'No pending device request found for this user.',
      );
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { pendingDeviceId: '', deviceModel: '', devicePlatform: '' },
    });

    return { message: 'Device registration request rejected' };
  }

  /**
   * Verify that the provided device ID matches the instructor's registered device.
   * Returns true if valid, false otherwise.
   */
  async verify(userId: string, deviceId: string): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('registeredDeviceId')
      .lean<{ registeredDeviceId?: string } | null>();

    if (!user || !user.registeredDeviceId) {
      return false;
    }

    return user.registeredDeviceId === deviceId;
  }

  async getMyDevice(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('registeredDeviceId pendingDeviceId deviceModel devicePlatform')
      .lean();

    return {
      registeredDeviceId: user?.registeredDeviceId ?? null,
      pendingDeviceId: user?.pendingDeviceId ?? null,
      deviceModel: user?.deviceModel ?? null,
      devicePlatform: user?.devicePlatform ?? null,
    };
  }

  async findAll(
    q: TableQueryDto,
    actor: AuthUserPayload,
  ): Promise<PaginatedResult<any>> {
    const scopeMatch = await this.userScopeService.userMatch(actor);

    const result = await paginateFind<UserDocument>(this.userModel, q, {
      searchFields: ['username', 'firstName', 'lastName', 'email', 'deviceModel'],
      defaultSort: { updatedAt: -1 },
      populate: { path: 'facultyId', select: 'name' },
      baseMatch: {
        ...scopeMatch,
        $or: [
          { pendingDeviceId: { $exists: true, $ne: null } },
          { registeredDeviceId: { $exists: true, $ne: null } },
        ],
      },
    });

    return {
      ...result,
      docs: result.docs.map((u) => ({
        _id: u._id,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        faculty: (u.facultyId as any)?.name,
        registeredDeviceId: u.registeredDeviceId,
        pendingDeviceId: u.pendingDeviceId,
        deviceModel: u.deviceModel,
        devicePlatform: u.devicePlatform,
        updatedAt: u.updatedAt,
      })),
    };
  }

  /**
   * Clear (unregister) the device for the given user.
   */
  async clearDevice(userId: string): Promise<{ message: string }> {
    const before = await this.userModel
      .findById(userId)
      .select('registeredDeviceId facultyId')
      .lean();

    await this.userModel.findByIdAndUpdate(userId, {
      $unset: {
        registeredDeviceId: '',
        pendingDeviceId: '',
        deviceModel: '',
        devicePlatform: '',
      },
    });

    await this.auditLog.record({
      action: AuditAction.DEVICE_CLEAR,
      entityType: AuditEntity.DEVICE,
      entityId: userId,
      facultyId: before?.facultyId as any,
      before: before?.registeredDeviceId
        ? { deviceId: before.registeredDeviceId }
        : null,
    });

    return { message: 'Device unregistered successfully' };
  }
}
