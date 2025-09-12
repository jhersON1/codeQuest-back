import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/user-roles.interface';
import { META_ROLES } from '../consts/meta-roles';

export const RoleProtected = (...args: UserRole[]) => {
  return SetMetadata(META_ROLES, args);
};
