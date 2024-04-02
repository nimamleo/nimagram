import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserWs = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const reqest = ctx.switchToWs().getClient();

    return reqest['user'];
  },
);
