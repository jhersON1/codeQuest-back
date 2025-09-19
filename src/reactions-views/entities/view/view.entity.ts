import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum ViewEntityType {
  Post = 'post',
}

@Entity({ name: 'views' })
@Index(['entity_type'])
@Index(['entity_id'])
@Index(['created_at'])
@Index(['viewer_user_id'])
export class View {
  @PrimaryGeneratedColumn({ name: 'view_id', type: 'integer' })
  view_id!: number;

  @Column({ name: 'entity_type', type: 'enum', enum: ViewEntityType })
  entity_type!: ViewEntityType;

  @Column({ name: 'entity_id', type: 'integer' })
  entity_id!: number;

  @Column({ name: 'viewer_user_id', type: 'uuid', nullable: true })
  viewer_user_id!: string | null;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip!: string | null;

  @Column({ name: 'fingerprint', type: 'varchar', length: 200, nullable: true })
  fingerprint!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;
}
