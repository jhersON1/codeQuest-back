import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoles } from '../enums/user-roles.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column('varchar', {
    length: 100,
    nullable: true,
  })
  discordId?: string;

  @Column('varchar', {
    length: 100,
    unique: true,
  })
  username: string;

  @Column('varchar', {
    length: 150,
    unique: true,
    nullable: true,
  })
  email: string;

  @Column('varchar', {
    length: 255,
    nullable: true,
  })
  password?: string;

  @Column('integer', {
    name: 'avatar_media_id',
    nullable: true,
  })
  avatar_media_id?: number | null;

  @Column('enum', {
    enum: UserRoles,
    default: UserRoles.SUBSCRIBER,
  })
  role: UserRoles;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
