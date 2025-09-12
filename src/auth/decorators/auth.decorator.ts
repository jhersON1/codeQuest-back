import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '../interfaces/user-roles.interface';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...args: UserRole[]) {
  return applyDecorators(RoleProtected(...args), UseGuards(AuthGuard(), UserRoleGuard));
}
