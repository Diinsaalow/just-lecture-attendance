import { SetMetadata } from '@nestjs/common';
import { CHECK_POLICIES_KEY } from '../guards/policies.guard';
import { Action } from '../constants/action.enum';
import { AppAbility } from '../casl-ability.factory';

/**
 * Shorthand decorator for checking a simple CASL permission.
 * Maps the action and resource to a policy handler.
 * 
 * @example @RequirePermission(Action.READ, Resource.DEVICE)
 */
export const RequirePermission = (action: Action, resource: string) =>
  SetMetadata(CHECK_POLICIES_KEY, [
    (ability: AppAbility) => ability.can(action, resource),
  ]);
