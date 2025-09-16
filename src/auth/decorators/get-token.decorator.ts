import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const auth = (req.headers?.authorization ?? '').toString();

  if (!auth.toLowerCase().startsWith('bearer ')) return null;

  return auth.slice(7);
});
