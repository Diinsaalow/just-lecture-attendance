import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AbilityRuleDto {
  /** CASL action(s), e.g. `read` or `['read','create']` */
  @IsOptional()
  action?: string | string[];

  @IsString()
  subject: string;

  @IsOptional()
  @IsArray()
  fields?: string[];

  @IsOptional()
  condition?: Record<string, unknown>;
}
