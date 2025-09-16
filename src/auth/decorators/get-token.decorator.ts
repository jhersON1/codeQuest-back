import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetToken = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest() as any;
  const auth = ((req.headers?.authorization as string) ?? '').toString();
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7);
});
