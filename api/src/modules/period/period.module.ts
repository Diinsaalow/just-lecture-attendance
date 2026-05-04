import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LectureClassModule } from '../classes/lecture-class.module';
import { CourseModule } from '../course/course.module';
import { SemesterModule } from '../semester/semester.module';
import { UsersModule } from '../users/users.module';
import { Period, PeriodSchema } from './schemas/period.schema';
import { PeriodController } from './period.controller';
import { PeriodService } from './period.service';

@Module({
  imports: [
    LectureClassModule,
    CourseModule,
    SemesterModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
  ],
  controllers: [PeriodController],
  providers: [PeriodService],
  exports: [PeriodService],
})
export class PeriodModule {}
