import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostTag } from '../post/post-tag.entity';

@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn({ name: 'tag_id', type: 'integer' })
  tag_id!: number;

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

  @OneToMany(() => PostTag, (pt) => pt.tag)
  postTags!: PostTag[];
}
