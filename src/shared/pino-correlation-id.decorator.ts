import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CorrelationId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    // should be set by pino logger
    const correlationId = req.id;

    if (!correlationId) {
      throw new TypeError(
        'Correlation id (req.id) is not defined. Correlation id should be set by pino logger. Please make sure that pino logger is setup correctly',
      );
    }

    return correlationId as string;
  },
);
