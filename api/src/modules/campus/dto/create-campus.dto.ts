import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EntityStatus } from '../../../common/enums/entity-status.enum';

export class CreateCampusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  campusName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  telephone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  location: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
