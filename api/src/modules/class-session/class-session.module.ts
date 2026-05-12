import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SemesterModule } from '../semester/semester.module';
import { AttendanceSettingsModule } from '../attendance-settings/attendance-settings.module';
import { Period, PeriodSchema } from '../period/schemas/period.schema';
import {
  LectureClass,
  LectureClassSchema,
} from '../classes/schemas/lecture-class.schema';
import {
  Department,
  DepartmentSchema,
} from '../department/schemas/department.schema';
import { Semester, SemesterSchema } from '../semester/schemas/semester.schema';
import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from '../attendance/schemas/attendance-record.schema';
import {
  ClassSession,
  ClassSessionSchema,
} from './schemas/class-session.schema';
import { ClassSessionService } from './class-session.service';
import { ClassSessionController } from './class-session.controller';

@Module({
  imports: [
    SemesterModule,
    AttendanceSettingsModule,
    MongooseModule.forFeature([
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: Period.name, schema: PeriodSchema },
      { name: LectureClass.name, schema: LectureClassSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
    ]),
  ],
  controllers: [ClassSessionController],
  providers: [ClassSessionService],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
