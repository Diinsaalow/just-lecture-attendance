import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AttendanceSettings,
  AttendanceSettingsSchema,
} from './schemas/attendance-settings.schema';
import { AttendanceSettingsController } from './attendance-settings.controller';
import { AttendanceSettingsService } from './attendance-settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceSettings.name, schema: AttendanceSettingsSchema },
    ]),
  ],
  controllers: [AttendanceSettingsController],
  providers: [AttendanceSettingsService],
  exports: [AttendanceSettingsService],
})
export class AttendanceSettingsModule {}
