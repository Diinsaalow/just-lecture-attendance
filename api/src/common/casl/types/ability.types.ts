import type { Action } from '../constants/action.enum';

export interface AbilityRule {
  action: Action | Action[] | string | string[];
  subject: string;
  fields?: string[];
  condition?: Record<string, unknown>;
}

export interface RoleAbilitySource {
  name: string;
  ability?: AbilityRule[];
}

export interface UserForAbility {
  role: RoleAbilitySource;
}
