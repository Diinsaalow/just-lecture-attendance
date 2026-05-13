import { Type } from 'class-transformer';
import {
  Allow,
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
  /**
   * Allowed so table GET requests can pass ad-hoc filters (e.g. `variant=staff` on GET /users)
   * without failing `forbidNonWhitelisted`. Handled in controllers, not in `paginateFind`.
   */
  @IsOptional()
  @IsString()
  variant?: string;

  /**
   * Flat filters from admin tables (`query[field]=value`).
   * Each service allowlists which keys are applied.
   */
  @IsOptional()
  @IsObject()
  query?: Record<string, string | string[] | undefined>;

  /** Inclusive scheduled-date lower bound (ISO), e.g. for attendance lists. */
  @IsOptional()
  @IsString()
  startDate?: string;

  /** Inclusive scheduled-date upper bound (ISO). */
  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TableSearchDto)
  search?: TableSearchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TableOptionsDto)
  options?: TableOptionsDto;

  /**
   * Accept-and-ignore: clients sometimes append `populate=...` to URLs.
   * We deliberately drop it server-side — `paginateFind` uses static, server-defined populates only.
   */
  @IsOptional()
  @Allow()
  populate?: unknown;
}
