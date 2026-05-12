import {
  Allow,
  IsEnum,
  IsMongoId,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { TimetablePeriodType } from '../enums/timetable-period-type.enum';
import { Weekday } from '../enums/weekday.enum';

const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreatePeriodDto {
  @IsMongoId()
  classId: string;

  @IsMongoId()
  courseId: string;

  @IsMongoId()
  lecturerId: string;

  @IsMongoId()
  semesterId: string;

  @IsEnum(Weekday, { message: 'day must be a valid weekday name' })
  day: Weekday;

  @IsEnum(TimetablePeriodType)
  type: TimetablePeriodType;

  @Matches(HHMM_REGEX, { message: 'from must be HH:mm 24-hour format' })
  from: string;

  @Matches(HHMM_REGEX, { message: 'to must be HH:mm 24-hour format' })
  to: string;

  @Allow()
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsMongoId()
  hallId?: string | null;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
