import { Type } from 'class-transformer';
import {
  IsArray,
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

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @IsMongoId()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  credit: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  lecturers?: string[];

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
