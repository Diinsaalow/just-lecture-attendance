import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AbilityRuleDto } from './ability-rule.dto';

export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'] as const)
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbilityRuleDto)
  ability?: AbilityRuleDto[];
}
