import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ClassSessionStatus } from '../enums/class-session-status.enum';

export class CreateClassSessionDto {
  @IsMongoId()
  periodId: string;

  /** Calendar teaching day. Stored as UTC midnight. */
  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;
}
