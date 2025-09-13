import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { Comment, CommentStatus } from './entities/comment/comment.entity';
import { CreateCommentDto } from './dto/comment/create-comment.dto';
import { UpdateCommentDto } from './dto/comment/update-comment.dto';
import { ListCommentsDto, CommentSort } from './dto/comment/list-comments.dto';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private readonly commentRepo: Repository<Comment>) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applySort(qb: SelectQueryBuilder<Comment>, sort?: CommentSort) {
    switch (sort) {
      case 'created_at_asc':
        qb.addOrderBy('comment.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        qb.addOrderBy('comment.created_at', 'DESC');
        break;
    }
  }

  async create(dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepo.create({
      post_id: dto.postId,
      parent_comment_id: dto.parentCommentId ?? null,
      user_id: null,
      body: dto.body,
      status: CommentStatus.Pending,
    });
    return this.commentRepo.save(comment);
  }

  async update(id: number, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { comment_id: id, deleted_at: IsNull() },
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    let edited = false;

    if (dto.body !== undefined && dto.body !== comment.body) {
      comment.body = dto.body;
      edited = true;
    }

    if (dto.status !== undefined) {
      comment.status = dto.status;
    }

    if (edited) comment.edited_at = new Date();

    return this.commentRepo.save(comment);
  }

  async softDelete(id: number): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { comment_id: id, deleted_at: IsNull() },
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    comment.deleted_at = new Date();
    await this.commentRepo.save(comment);
  }

  async findOneById(id: number): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { comment_id: id, deleted_at: IsNull() },
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    return comment;
  }

  async list(params: ListCommentsDto): Promise<Paginated<Comment>> {
    const { page, limit, postId, parentCommentId, status, sort } = params;
    const qb = this.commentRepo.createQueryBuilder('comment');

    qb.where('comment.deleted_at IS NULL').andWhere('comment.post_id = :postId', { postId });

    if (parentCommentId !== undefined) {
      qb.andWhere('comment.parent_comment_id = :pid', { pid: parentCommentId });
    } else {
      qb.andWhere('comment.parent_comment_id IS NULL');
    }

    if (status) qb.andWhere('comment.status = :status', { status });

    this.applySort(qb, sort ?? 'created_at_desc');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }
}
