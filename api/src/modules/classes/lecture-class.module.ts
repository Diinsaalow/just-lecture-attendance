import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicYearModule } from '../academic-year/academic-year.module';
import { CampusModule } from '../campus/campus.module';
import { DepartmentModule } from '../department/department.module';
import {
  LectureClass,
  LectureClassSchema,
} from './schemas/lecture-class.schema';
import { LectureClassController } from './lecture-class.controller';
import { LectureClassService } from './lecture-class.service';

@Module({
  imports: [
    DepartmentModule,
    CampusModule,
    AcademicYearModule,
    MongooseModule.forFeature([
      { name: LectureClass.name, schema: LectureClassSchema },
    ]),
  ],
  controllers: [LectureClassController],
  providers: [LectureClassService],
  exports: [LectureClassService],
})
export class LectureClassModule {}
