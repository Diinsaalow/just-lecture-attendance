import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUserPayload = {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return request.user;
  },
);
