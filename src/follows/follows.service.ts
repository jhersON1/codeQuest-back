import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Follow } from './entities/follow/follow.entity';
import { CreateFollowDto } from './dto/follow/create-follow.dto';
import { ListFollowsDto, FollowSort } from './dto/follow/list-follows.dto';
import { DeleteFollowDto } from './dto/follow/delete-follow.dto';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class FollowsService {
  constructor(@InjectRepository(Follow) private readonly repo: Repository<Follow>) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applySort(query: SelectQueryBuilder<Follow>, sort?: FollowSort) {
    switch (sort) {
      case 'created_at_asc':
        query.addOrderBy('follow.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        query.addOrderBy('follow.created_at', 'DESC');
        break;
    }
  }

  async createFollow(dto: CreateFollowDto): Promise<Follow> {
    const { followerUserId, entityType, entityId } = dto;

    if (!followerUserId || !entityType || !entityId) {
      throw new BadRequestException('Datos incompletos para crear follow');
    }

    const existing = await this.repo.findOne({
      where: {
        follower_user_id: followerUserId,
        entity_type: entityType,
        entity_id: entityId,
      },
    });

    if (existing) return existing;

    const toCreate = this.repo.create({
      follower_user_id: followerUserId,
      entity_type: entityType,
      entity_id: entityId,
    });
    return this.repo.save(toCreate);
  }

  async listFollows(params: ListFollowsDto): Promise<Paginated<Follow>> {
    const { page, limit, followerUserId, entityType, entityId, sort } = params;

    if (!followerUserId) {
      throw new BadRequestException('followerUserId es requerido');
    }

    const query = this.repo.createQueryBuilder('follow');
    query.where('follow.follower_user_id = :uid', { uid: followerUserId });

    if (entityType) {
      query.andWhere('follow.entity_type = :etype', { etype: entityType });
    }

    if (entityId) {
      query.andWhere('follow.entity_id = :eid', { eid: entityId });
    }

    this.applySort(query, sort ?? 'created_at_desc');
    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async removeById(id: number): Promise<{ affected: number }> {
    const result = await this.repo.delete({ follow_id: id });

    if (!result.affected) throw new NotFoundException('Follow no encontrado');

    return { affected: result.affected };
  }

  async removeByComposite(dto: DeleteFollowDto): Promise<{ affected: number }> {
    const { followerUserId, entityType, entityId } = dto;
    const result = await this.repo.delete({
      follower_user_id: followerUserId,
      entity_type: entityType,
      entity_id: entityId,
    });

    if (!result.affected) throw new NotFoundException('Follow no encontrado');

    return { affected: result.affected };
  }
}
