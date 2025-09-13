import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostCategory } from './post-category.entity';
import { PostTag } from './post-tag.entity';

export enum PostStatus {
  Draft = 'draft',
  Published = 'published',
}

export enum PostVisibility {
  Public = 'public',
  Unlisted = 'unlisted',
  Private = 'private',
}

@Entity({ name: 'posts' })
@Index(['status'])
@Index(['published_at'])
export class Post {
  @PrimaryGeneratedColumn({ name: 'post_id', type: 'integer' })
  post_id!: number;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'varchar', unique: true })
  @Index({ unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  excerpt!: string | null;

  @Column({ type: 'text' })
  body!: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.Draft,
  })
  status!: PostStatus;

  @Column({ type: 'timestamptz', nullable: true })
  published_at!: Date | null;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.Public,
  })
  visibility!: PostVisibility;

  @Column({ name: 'cover_image_id', type: 'integer', nullable: true })
  cover_image_id!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => PostCategory, (pc) => pc.post, {
    cascade: false,
  })
  postCategories!: PostCategory[];

  @OneToMany(() => PostTag, (pt) => pt.post, {
    cascade: false,
  })
  postTags!: PostTag[];
}
