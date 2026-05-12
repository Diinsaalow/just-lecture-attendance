import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ATTENDANCE_SETTINGS_SINGLETON_KEY,
  AttendanceSettings,
  AttendanceSettingsDocument,
} from './schemas/attendance-settings.schema';
import { CreateAttendanceSettingsDto } from './dto/create-attendance-settings.dto';
import { UpdateAttendanceSettingsDto } from './dto/update-attendance-settings.dto';

@Injectable()
export class AttendanceSettingsService {
  constructor(
    @InjectModel(AttendanceSettings.name)
    private readonly settingsModel: Model<AttendanceSettingsDocument>,
  ) {}

  /**
   * Retrieve the singleton settings document.
   * Returns null when no settings have been configured yet.
   */
  async getSettings(): Promise<AttendanceSettings | null> {
    return this.settingsModel
      .findOne({ singletonKey: ATTENDANCE_SETTINGS_SINGLETON_KEY })
      .exec();
  }

  /**
   * Retrieve the settings or throw if not yet configured.
   * Used by the attendance validation pipeline.
   */
  async getSettingsOrFail(): Promise<AttendanceSettings> {
    const settings = await this.getSettings();
    if (!settings) {
      throw new NotFoundException(
        'Attendance settings have not been configured. An admin must configure attendance settings before attendance operations are allowed.',
      );
    }
    return settings;
  }

  /**
   * Create the initial settings document, or update it if one already exists.
   * The unique `singletonKey` index protects against concurrent inserts.
   */
  async create(dto: CreateAttendanceSettingsDto): Promise<AttendanceSettings> {
    return this.settingsModel
      .findOneAndUpdate(
        { singletonKey: ATTENDANCE_SETTINGS_SINGLETON_KEY },
        {
          $set: { ...dto },
          $setOnInsert: { singletonKey: ATTENDANCE_SETTINGS_SINGLETON_KEY },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  /**
   * Update the singleton settings document.
   */
  async update(dto: UpdateAttendanceSettingsDto): Promise<AttendanceSettings> {
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    const existing = await this.getSettings();
    if (!existing) {
      throw new NotFoundException(
        'Attendance settings have not been created yet. Use POST to create initial settings.',
      );
    }
    if (!Object.keys(patch).length) {
      return existing;
    }

    const updated = await this.settingsModel
      .findOneAndUpdate(
        { singletonKey: ATTENDANCE_SETTINGS_SINGLETON_KEY },
        { $set: patch },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Attendance settings not found');
    }
    return updated;
  }
}
