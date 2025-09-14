import { User } from 'src/auth/entities/user.entity';

export interface RequestWithUser extends Express.Request {
  user?: User;
}

export function isRequestWithUser(obj: unknown): obj is RequestWithUser {
  return typeof obj === 'object' && obj !== null && 'user' in obj;
}
