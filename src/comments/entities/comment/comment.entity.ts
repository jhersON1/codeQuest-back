import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum CommentStatus {
  Approved = 'approved',
  Pending = 'pending',
  Spam = 'spam',
}

@Entity({ name: 'comments' })
@Index(['post_id'])
@Index(['parent_comment_id'])
@Index(['status'])
@Index(['created_at'])
export class Comment {
  @PrimaryGeneratedColumn({ name: 'comment_id', type: 'integer' })
  comment_id!: number;

  @Column({ name: 'post_id', type: 'integer' })
  post_id!: number;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  user_id!: number | null;

  @Column({ name: 'parent_comment_id', type: 'integer', nullable: true })
  parent_comment_id!: number | null;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.Pending })
  status!: CommentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  edited_at!: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;
}
