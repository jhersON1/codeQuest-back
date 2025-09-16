import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostCategory } from './post-category.entity';
import { PostTag } from './post-tag.entity';
import { Comment } from '../../../comments/entities/comment/comment.entity';
import { Reaction } from '../../../reactions-views/entities/reaction/reaction.entity';
import { User } from '../../../auth/entities/user.entity';

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
@Index(['author_user_id'])
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

  @Column({ name: 'author_user_id', type: 'uuid' })
  author_user_id!: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'author_user_id' })
  author!: User;

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

  @OneToMany(() => Comment, (comment) => comment.post_id, {
    cascade: false,
  })
  comments!: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.entity_id, {
    cascade: false,
  })
  reactions!: Reaction[];
}
