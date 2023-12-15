import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserCredentials } from './user-credentials';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    // should be set by AuthGuard
    const user = req.user;

    if (!user) {
      throw new TypeError(
        'User (req.user) is not defined. Please use @AuthGuard to obtain current user credentials',
      );
    }

    return user as UserCredentials;
  },
);
