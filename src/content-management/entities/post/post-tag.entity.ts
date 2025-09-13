import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';
import { Tag } from '../tag/tag.entity';

@Entity({ name: 'post_tags' })
export class PostTag {
  @PrimaryColumn({ type: 'integer' })
  post_id!: number;

  @PrimaryColumn({ type: 'integer' })
  tag_id!: number;

  @ManyToOne(() => Post, (post) => post.postTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @ManyToOne(() => Tag, (tag) => tag.postTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tag_id' })
  tag!: Tag;
}
