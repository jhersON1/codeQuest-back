import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-roles.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column('varchar', {
    length: 100,
  })
  username: string;

  @Column('varchar', {
    length: 150,
    unique: true,
  })
  email: string;

  @Column('varchar', {
    length: 255,
  })
  password: string;

  @Column('enum', {
    enum: UserRole,
    default: UserRole.SUBSCRIBER,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
