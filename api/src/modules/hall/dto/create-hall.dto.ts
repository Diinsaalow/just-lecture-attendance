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

export class CreateHallDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  code: string;

  @IsMongoId()
  @IsNotEmpty()
  campusId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  building?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  floor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
