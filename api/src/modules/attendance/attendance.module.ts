import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from './schemas/attendance-record.schema';
import {
  ClassSession,
  ClassSessionSchema,
} from '../class-session/schemas/class-session.schema';
import { Hall, HallSchema } from '../hall/schemas/hall.schema';
import { AttendanceSettingsModule } from '../attendance-settings/attendance-settings.module';
import { DeviceModule } from '../device/device.module';
import { CaslModule } from '../../common/casl/casl.module';
import { AttendanceValidationService } from './attendance-validation.service';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: Hall.name, schema: HallSchema },
    ]),
    AttendanceSettingsModule,
    DeviceModule,
    CaslModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceValidationService, AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
