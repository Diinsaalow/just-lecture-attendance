import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum';

export class CreateLectureClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsMongoId()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shift: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  size: number;

  @IsMongoId()
  campusId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  batchId: string;

  @IsMongoId()
  academicYearId: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
