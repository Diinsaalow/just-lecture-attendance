import { IsEnum, IsOptional } from 'class-validator';
import { ClassSessionStatus } from '../enums/class-session-status.enum';

export class UpdateClassSessionDto {
  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;
}
