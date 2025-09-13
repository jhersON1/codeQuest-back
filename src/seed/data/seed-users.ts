import { UserRoles } from '../../auth/enums/user-roles.enum';

interface SeedUser {
  email: string;
  password: string;
  username: string;
  role: UserRoles;
}

export const seedUsers: SeedUser[] = [
  {
    email: 'admin@example.com',
    password: 'admin1234',
    username: 'admin',
    role: UserRoles.ADMIN,
  },
  {
    email: 'user1@example.com',
    password: 'user1_1234',
    username: 'user1',
    role: UserRoles.SUBSCRIBER,
  },
  {
    email: 'user2@example.com',
    password: 'user2_1234',
    username: 'user2',
    role: UserRoles.SUBSCRIBER,
  },
];
