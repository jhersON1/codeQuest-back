import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'bookmarks' })
@Index(['post_id'])
@Index(['user_id'])
@Index(['session_id'])
@Index(['created_at'])
export class Bookmark {
  @PrimaryGeneratedColumn({ name: 'bookmark_id', type: 'integer' })
  bookmark_id!: number;

  @Column({ name: 'post_id', type: 'integer' })
  post_id!: number;

  @Column({ name: 'user_id', type: 'integer', nullable: true })
  user_id!: number | null;

  @Column({ name: 'session_id', type: 'varchar', length: 200, nullable: true })
  session_id!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;
}
