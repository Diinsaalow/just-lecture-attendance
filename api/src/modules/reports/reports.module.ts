import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from '../attendance/schemas/attendance-record.schema';
import {
  ClassSession,
  ClassSessionSchema,
} from '../class-session/schemas/class-session.schema';
import {
  AbsenceSubmission,
  AbsenceSubmissionSchema,
} from '../submission/schemas/absence-submission.schema';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: AbsenceSubmission.name, schema: AbsenceSubmissionSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
