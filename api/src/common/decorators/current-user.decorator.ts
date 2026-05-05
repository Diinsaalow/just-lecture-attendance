import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RoleAbilityRule = {
  action: string | string[];
  subject: string;
  fields?: string[];
  condition?: Record<string, unknown>;
};

/** Attached by JwtStrategy — shapes CASL `createForUser`. */
export type AuthUserPayload = {
  id: string;
  username: string;
  isActive: boolean;
  facultyId?: string;
  role: {
    name: string;
    ability?: RoleAbilityRule[];
  };
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return request.user;
  },
);
