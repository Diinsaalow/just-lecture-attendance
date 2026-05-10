import { Injectable } from '@nestjs/common';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Action } from './constants/action.enum';
import {
  defaultAbilitiesForRole,
  normalizeRoleName,
} from './role-ability-templates';
import type { AbilityRule, UserForAbility } from './types/ability.types';

export type AppAbility = PureAbility<[Action, string]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserForAbility): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    const roleName = user?.role?.name;
    if (!roleName) {
      return build();
    }

    const normalized = normalizeRoleName(roleName);
    const rules: AbilityRule[] =
      user.role.ability && user.role.ability.length > 0
        ? user.role.ability
        : defaultAbilitiesForRole(normalized);

    for (const rule of rules) {
      const actions = (
        Array.isArray(rule.action) ? rule.action : [rule.action]
      ) as Action[];
      const subject = rule.subject;
      for (const raw of actions) {
        const action = typeof raw === 'string' ? raw : raw;
        can(action, subject);
      }
    }

    return build();
  }
}
