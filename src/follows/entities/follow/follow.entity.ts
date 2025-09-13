import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum FollowEntityType {
  USER = 'user',
  POST = 'post',
  CATEGORY = 'category',
}

@Entity({ name: 'follows' })
@Index(['follower_user_id'])
@Index(['entity_type', 'entity_id'])
@Index(['created_at'])
export class Follow {
  @PrimaryGeneratedColumn({ name: 'follow_id', type: 'integer' })
  follow_id!: number;

  @Column({ name: 'follower_user_id', type: 'integer', nullable: true })
  follower_user_id!: number | null;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: FollowEntityType,
    enumName: 'follow_entity_type',
  })
  entity_type!: FollowEntityType;

  @Column({ name: 'entity_id', type: 'integer' })
  entity_id!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;
}
