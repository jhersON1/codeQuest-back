interface UserRolesInterface {
  admin: 'admin';
  author: 'author';
  subscriber: 'subscriber';
}

export type UserRole = keyof UserRolesInterface;
