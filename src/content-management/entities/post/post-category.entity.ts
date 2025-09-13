import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';
import { Category } from '../category/category.entity';

@Entity({ name: 'post_categories' })
export class PostCategory {
  @PrimaryColumn({ type: 'integer' })
  post_id!: number;

  @PrimaryColumn({ type: 'integer' })
  category_id!: number;

  @ManyToOne(() => Post, (post) => post.postCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @ManyToOne(() => Category, (category) => category.postCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}
