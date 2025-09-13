import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostCategory } from '../post/post-category.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'integer' })
  category_id!: number;

  @Column({ type: 'varchar', unique: true })
  @Index({ unique: true })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  @Index({ unique: true })
  slug!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => PostCategory, (pc) => pc.category)
  postCategories!: PostCategory[];
}
