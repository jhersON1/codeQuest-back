import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'oauth_accounts' })
@Index(['provider', 'provider_user_id'], { unique: true })
@Index(['user_id'])
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 30 })
  provider!: string; // e.g., 'discord'

  @Column({ name: 'provider_user_id', type: 'varchar', length: 100 })
  provider_user_id!: string;

  @Column({ name: 'access_token', type: 'varchar', length: 500, nullable: true })
  access_token!: string | null;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refresh_token!: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expires_at!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}

