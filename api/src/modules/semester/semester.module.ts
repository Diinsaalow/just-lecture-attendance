import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicYearModule } from '../academic-year/academic-year.module';
import { Semester, SemesterSchema } from './schemas/semester.schema';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';

@Module({
  imports: [
    AcademicYearModule,
    MongooseModule.forFeature([
      { name: Semester.name, schema: SemesterSchema },
    ]),
  ],
  controllers: [SemesterController],
  providers: [SemesterService],
  exports: [SemesterService],
})
export class SemesterModule {}
