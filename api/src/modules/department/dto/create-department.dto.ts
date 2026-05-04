import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  graduationName: string;

  @IsMongoId()
  facultyId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  duration: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  abbreviation: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  degree: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
