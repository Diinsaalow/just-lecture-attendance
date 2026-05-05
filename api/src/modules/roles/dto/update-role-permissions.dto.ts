import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { AbilityRuleDto } from './ability-rule.dto';

export class UpdateRolePermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbilityRuleDto)
  ability: AbilityRuleDto[];
}
