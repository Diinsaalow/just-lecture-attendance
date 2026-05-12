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
} from './schemas/absence-submission.schema';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AbsenceSubmission.name, schema: AbsenceSubmissionSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
    ]),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
