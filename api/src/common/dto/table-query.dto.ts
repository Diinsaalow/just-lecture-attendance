import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TableSearchDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  /** Accepts array or numeric-keyed object from query string parsers */
  @IsOptional()
  fields?: string[] | Record<string, string>;
}

export class TableOptionsDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsObject()
  sort?: Record<string, string>;
}

export class TableQueryDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TableSearchDto)
  search?: TableSearchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TableOptionsDto)
  options?: TableOptionsDto;
}
