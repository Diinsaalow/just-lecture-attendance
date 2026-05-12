import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SubmissionType } from '../enums/submission-type.enum';

export class CreateSubmissionDto {
  @IsMongoId()
  @IsNotEmpty()
  sessionId: string;

  @IsEnum(SubmissionType)
  type: SubmissionType;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
