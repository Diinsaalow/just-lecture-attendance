import { Logger } from '@nestjs/common';
import { Action } from '../constants/action.enum';
import type { AppAbility } from '../casl-ability.factory';
import type { IPolicyHandler } from '../types/policy-handler.interface';

export class BasePolicyHandler implements IPolicyHandler {
  constructor(
    protected readonly action: Action,
    protected readonly subject: string,
  ) {}

  handle(ability: AppAbility): boolean {
    Logger.debug(
      `Policy ${this.action} ${this.subject} => ${ability.can(this.action, this.subject)}`,
      BasePolicyHandler.name,
    );
    return ability.can(this.action, this.subject);
  }
}

export function createPolicyHandler(
  action: Action,
  subject: string,
): IPolicyHandler {
  return new BasePolicyHandler(action, subject);
}
