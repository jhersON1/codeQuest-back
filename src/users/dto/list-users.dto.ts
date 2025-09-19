import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserRoles } from '../../auth/enums/user-roles.enum';

export type UsersSort = 'created_at_desc' | 'created_at_asc' | 'username_asc' | 'username_desc';

export class ListUsersDto {
  @IsInt()
  @Min(1)
  page = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(UserRoles)
  role?: UserRoles;

  @IsOptional()
  @IsString()
  sort?: UsersSort;
}
