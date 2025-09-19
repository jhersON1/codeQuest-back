import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'bookmarks' })
@Index(['post_id'])
@Index(['user_id'])
@Index(['created_at'])
@Unique('uq_bookmark_user_post', ['user_id', 'post_id'])
export class Bookmark {
  @PrimaryGeneratedColumn({ name: 'bookmark_id', type: 'integer' })
  bookmark_id!: number;

  @Column({ name: 'post_id', type: 'integer' })
  post_id!: number;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @Column({ name: 'session_id', type: 'varchar', length: 200, nullable: true })
  session_id!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;
}
