import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Semester } from '../../modules/semester/schemas/semester.schema';
import { Period } from '../../modules/period/schemas/period.schema';
import { LectureClass } from '../../modules/classes/schemas/lecture-class.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const semesterModel = app.get<Model<Semester>>(getModelToken(Semester.name));
  const periodModel = app.get<Model<Period>>(getModelToken(Period.name));
  const classModel = app.get<Model<LectureClass>>(getModelToken(LectureClass.name));

  const semesterCount = await semesterModel.countDocuments();
  const classCount = await classModel.countDocuments();
  const periodCount = await periodModel.countDocuments();

  console.log(`Verification:`);
  console.log(`Semesters: ${semesterCount}`);
  console.log(`Classes: ${classCount}`);
  console.log(`Periods: ${periodCount}`);

  await app.close();
}

bootstrap();
