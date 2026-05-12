import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HallModule } from '../hall/hall.module';
import { LectureClassModule } from '../classes/lecture-class.module';
import { CourseModule } from '../course/course.module';
import { SemesterModule } from '../semester/semester.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import {
  Department,
  DepartmentSchema,
} from '../department/schemas/department.schema';
import { Period, PeriodSchema } from './schemas/period.schema';
import { PeriodController } from './period.controller';
import { PeriodService } from './period.service';

@Module({
  imports: [
    HallModule,
    LectureClassModule,
    CourseModule,
    SemesterModule,
    UsersModule,
    RolesModule,
    MongooseModule.forFeature([
      { name: Period.name, schema: PeriodSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [PeriodController],
  providers: [PeriodService],
  exports: [PeriodService],
})
export class PeriodModule {}
