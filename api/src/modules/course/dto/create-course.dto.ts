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

import { CourseType } from '../enums/course-type.enum';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsEnum(CourseType)
  type: CourseType;

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
