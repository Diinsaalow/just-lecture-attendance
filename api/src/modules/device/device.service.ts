import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Register (or replace) a device ID for the authenticated instructor.
   * Each instructor is limited to exactly 1 registered device.
   */
  async register(
    userId: string,
    deviceId: string,
  ): Promise<{ message: string; deviceId: string }> {
    // Check if another instructor already has this device registered
    const existingUser = await this.userModel
      .findOne({ registeredDeviceId: deviceId, _id: { $ne: userId } })
      .select('_id username')
      .lean();

    if (existingUser) {
      throw new ConflictException(
        'This device is already registered to another instructor.',
      );
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { registeredDeviceId: deviceId } },
        { new: true },
      )
      .select('registeredDeviceId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Device registered successfully', deviceId };
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

  /**
   * Get the registered device ID for the authenticated instructor.
   */
  async getMyDevice(userId: string): Promise<{ deviceId: string | null }> {
    const user = await this.userModel
      .findById(userId)
      .select('registeredDeviceId')
      .lean<{ registeredDeviceId?: string } | null>();

    return { deviceId: user?.registeredDeviceId ?? null };
  }

  /**
   * Clear (unregister) the device for the given user.
   * Used by admins or the instructor themselves.
   */
  async clearDevice(userId: string): Promise<{ message: string }> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $unset: { registeredDeviceId: '' } },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Device unregistered successfully' };
  }
}
