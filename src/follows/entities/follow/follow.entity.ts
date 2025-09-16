import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum FollowEntityType {
  USER = 'user',
  POST = 'post',
  CATEGORY = 'category',
}

@Entity({ name: 'follows' })
@Index(['follower_user_id'])
@Index(['entity_type', 'entity_id'])
@Index(['created_at'])
@Unique('uq_follow_user_entity', ['follower_user_id', 'entity_type', 'entity_id'])
export class Follow {
  @PrimaryGeneratedColumn({ name: 'follow_id', type: 'integer' })
  follow_id!: number;

  @Column({ name: 'follower_user_id', type: 'uuid' })
  follower_user_id!: string;

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
