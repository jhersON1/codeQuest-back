import { CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ReactionEntityType {
  Post = 'post',
  Comment = 'comment',
}

export enum ReactionType {
  Like = 'like',
}

@Entity({ name: 'reactions' })
@Index(['user_id', 'entity_type', 'entity_id', 'type'], { unique: true })
@Index(['created_at'])
export class Reaction {
  @PrimaryGeneratedColumn({ name: 'reaction_id', type: 'integer' })
  reaction_id!: number;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @Column({ name: 'entity_type', type: 'enum', enum: ReactionEntityType })
  entity_type!: ReactionEntityType;

  @Column({ name: 'entity_id', type: 'integer' })
  entity_id!: number;

  @Column({ name: 'type', type: 'enum', enum: ReactionType })
  type!: ReactionType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;
}
