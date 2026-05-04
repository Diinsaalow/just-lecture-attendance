import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { TimetablePeriodType } from '../enums/timetable-period-type.enum';

export class CreatePeriodDto {
  @IsMongoId()
  classId: string;

  @IsMongoId()
  courseId: string;

  @IsMongoId()
  lecturerId: string;

  @IsMongoId()
  semesterId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  day: string;

  @IsEnum(TimetablePeriodType)
  type: TimetablePeriodType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  from: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  to: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
