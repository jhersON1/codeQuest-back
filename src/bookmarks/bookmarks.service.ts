import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Bookmark } from './entities/bookmark/bookmark.entity';
import { CreateBookmarkDto } from './dto/bookmark/create-bookmark.dto';
import { ListBookmarksDto, BookmarkSort } from './dto/bookmark/list-bookmarks.dto';
import { DeleteBookmarkDto } from './dto/bookmark/delete-bookmark.dto';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class BookmarksService {
  constructor(@InjectRepository(Bookmark) private readonly repo: Repository<Bookmark>) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applySort(query: SelectQueryBuilder<Bookmark>, sort?: BookmarkSort) {
    switch (sort) {
      case 'created_at_asc':
        query.addOrderBy('bookmark.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        query.addOrderBy('bookmark.created_at', 'DESC');
        break;
    }
  }

  async createBookmark(dto: CreateBookmarkDto): Promise<Bookmark> {
    const hasUser = dto.userId !== undefined && dto.userId !== null;
    const hasSession =
      dto.sessionId !== undefined && dto.sessionId !== null && dto.sessionId !== '';

    if (!hasUser && !hasSession) {
      throw new BadRequestException('Debe proporcionar userId o sessionId');
    }

    if (hasUser) {
      const existing = await this.repo.findOne({
        where: { user_id: dto.userId!, post_id: dto.postId },
      });

      if (existing) return existing;

      const toCreate = this.repo.create({
        post_id: dto.postId,
        user_id: dto.userId!,
        session_id: null,
      });
      return this.repo.save(toCreate);
    }

    const existing = await this.repo.findOne({
      where: { session_id: dto.sessionId!, post_id: dto.postId },
    });

    if (existing) return existing;

    const toCreate = this.repo.create({
      post_id: dto.postId,
      session_id: dto.sessionId!,
    });
    return this.repo.save(toCreate);
  }

  async createForUser(userId: string, postId: number): Promise<Bookmark> {
    const existing = await this.repo.findOne({
      where: { user_id: userId, post_id: postId },
    });

    if (existing) return existing;

    const toCreate = this.repo.create({
      post_id: postId,
      user_id: userId,
      session_id: null,
    });
    return this.repo.save(toCreate);
  }

  async listBookmarks(params: ListBookmarksDto): Promise<Paginated<Bookmark>> {
    const { page, limit, userId, sessionId, sort } = params;

    if (userId === undefined && sessionId === undefined) {
      throw new BadRequestException('Debe proporcionar userId o sessionId');
    }

    const query = this.repo.createQueryBuilder('bookmark');

    if (userId !== undefined) {
      query.where('bookmark.user_id = :uid', { uid: userId });
    } else if (sessionId !== undefined) {
      query.where('bookmark.session_id = :sid', { sid: sessionId });
    }

    this.applySort(query, sort ?? 'created_at_desc');
    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async deleteById(bookmarkId: number): Promise<void> {
    const result = await this.repo.delete({ bookmark_id: bookmarkId });

    if (!result.affected) throw new NotFoundException('Bookmark no encontrado');
  }

  async deleteByIdForUser(bookmarkId: number, userId: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { bookmark_id: bookmarkId } });

    if (!entity) throw new NotFoundException('Bookmark no encontrado');

    if (entity.user_id !== userId) throw new BadRequestException('No autorizado');

    await this.repo.delete({ bookmark_id: bookmarkId });
  }

  async deleteByComposite(dto: DeleteBookmarkDto): Promise<void> {
    const hasUser = dto.userId !== undefined && dto.userId !== null;
    const hasSession =
      dto.sessionId !== undefined && dto.sessionId !== null && dto.sessionId !== '';

    if (!hasUser && !hasSession) {
      throw new BadRequestException('Debe proporcionar userId o sessionId');
    }

    const where = hasUser
      ? { post_id: dto.postId, user_id: dto.userId! }
      : { post_id: dto.postId, session_id: dto.sessionId! };

    const result = await this.repo.delete(where);

    if (!result.affected) throw new NotFoundException('Bookmark no encontrado');
  }

  async deleteByCompositeForUser(userId: string, postId: number): Promise<void> {
    const res = await this.repo.delete({ user_id: userId, post_id: postId });

    if (!res.affected) throw new NotFoundException('Bookmark no encontrado');
  }
}
