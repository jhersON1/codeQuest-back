import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { isRequestWithUser, RequestWithUser } from '../../common/request-with-user';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<RequestWithUser>();

  if (!isRequestWithUser(req) || !req.user) {
    throw new InternalServerErrorException('User not found in request');
  }

  const user: User = req.user;

  if (!user) throw new InternalServerErrorException('User not found in request');

  return user;
});
