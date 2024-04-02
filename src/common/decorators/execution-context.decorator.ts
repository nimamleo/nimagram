import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExecutionCtx = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx;
  },
);
