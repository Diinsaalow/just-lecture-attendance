import { Transform, Type } from 'class-transformer';
import {
  Allow,
  IsArray,
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

export class TablePopulateDto {
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  dir?: string;

  @IsOptional()
  @IsString()
  select?: string;
}

function normalizeOptionsPopulate(
  value: unknown,
): TablePopulateDto[] | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value as TablePopulateDto[];
  }
  if (typeof value === 'object' && value !== null) {
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b));
    if (keys.length > 0) {
      return keys.map((k) => o[k]) as TablePopulateDto[];
    }
  }
  return undefined;
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

  /**
   * qs may parse options[populate][n] as an object with numeric keys; @Allow keeps
   * forbidNonWhitelisted from rejecting this field when nested typing is imperfect.
   */
  @IsOptional()
  @Allow()
  @Transform(({ value }) => normalizeOptionsPopulate(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TablePopulateDto)
  populate?: TablePopulateDto[];
}

export class TableQueryDto {
  /**
   * Allowed so table GET requests can pass ad-hoc filters (e.g. `variant=staff` on GET /users)
   * without failing `forbidNonWhitelisted`. Handled in controllers, not in `paginateFind`.
   */
  @IsOptional()
  @IsString()
  variant?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TableSearchDto)
  search?: TableSearchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TableOptionsDto)
  options?: TableOptionsDto;

  @IsOptional()
  @Allow()
  populate?: any;
}
