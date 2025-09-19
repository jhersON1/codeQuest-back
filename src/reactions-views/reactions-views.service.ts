import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Reaction } from './entities/reaction/reaction.entity';
import { View, ViewEntityType } from './entities/view/view.entity';
import { CreateReactionDto } from './dto/reaction/create-reaction.dto';
import { ListReactionsDto, ReactionSort } from './dto/reaction/list-reactions.dto';
import { DeleteReactionDto } from './dto/reaction/delete-reaction.dto';
import { CreateViewDto } from './dto/view/create-view.dto';
import { ListViewsDto, ViewSort } from './dto/view/list-views.dto';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class ReactionsViewsService {
  constructor(
    @InjectRepository(Reaction) private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(View) private readonly viewRepo: Repository<View>,
  ) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applyReactionSort(qb: SelectQueryBuilder<Reaction>, sort?: ReactionSort) {
    switch (sort) {
      case 'created_at_asc':
        qb.addOrderBy('reaction.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        qb.addOrderBy('reaction.created_at', 'DESC');
        break;
    }
  }

  private applyViewSort(qb: SelectQueryBuilder<View>, sort?: ViewSort) {
    switch (sort) {
      case 'created_at_asc':
        qb.addOrderBy('view.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        qb.addOrderBy('view.created_at', 'DESC');
        break;
    }
  }

  async createReactionForUser(userId: string, dto: CreateReactionDto): Promise<Reaction> {
    const existing = await this.reactionRepo.findOne({
      where: {
        user_id: userId,
        entity_type: dto.entityType,
        entity_id: dto.entityId,
        type: dto.type,
      },
    });

    if (existing) return existing;

    const reaction = this.reactionRepo.create({
      user_id: userId,
      entity_type: dto.entityType,
      entity_id: dto.entityId,
      type: dto.type,
    });
    return this.reactionRepo.save(reaction);
  }

  async listReactions(params: ListReactionsDto): Promise<Paginated<Reaction>> {
    const { page, limit, entityType, entityId, type, userId, sort } = params;
    const qb = this.reactionRepo.createQueryBuilder('reaction');

    if (entityType) qb.andWhere('reaction.entity_type = :et', { et: entityType });

    if (entityId) qb.andWhere('reaction.entity_id = :eid', { eid: entityId });

    if (type) qb.andWhere('reaction.type = :rt', { rt: type });

    if (userId) qb.andWhere('reaction.user_id = :uid', { uid: userId });

    this.applyReactionSort(qb, sort ?? 'created_at_desc');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async deleteReactionById(id: number, userId: string): Promise<void> {
    const entity = await this.reactionRepo.findOne({ where: { reaction_id: id } });

    if (!entity) throw new NotFoundException('Reacción no encontrada');

    if (entity.user_id !== userId) throw new ForbiddenException('No autorizado');

    await this.reactionRepo.delete({ reaction_id: id });
  }

  async deleteReaction(dto: DeleteReactionDto, userId: string): Promise<void> {
    if (dto.reactionId) return this.deleteReactionById(dto.reactionId, userId);

    if (!dto.entityType || !dto.entityId || !dto.type) {
      throw new BadRequestException('Faltan parámetros para borrado por combinación');
    }

    const res = await this.reactionRepo.delete({
      user_id: userId,
      entity_type: dto.entityType,
      entity_id: dto.entityId,
      type: dto.type,
    });

    if (!res.affected) throw new NotFoundException('Reacción no encontrada');
  }

  async createView(dto: CreateViewDto): Promise<View> {
    const view = this.viewRepo.create({
      entity_type: dto.entityType,
      entity_id: dto.entityId,
      viewer_user_id: dto.viewerUserId ?? null,
      ip: dto.ip ?? null,
      fingerprint: dto.fingerprint ?? null,
    });
    return this.viewRepo.save(view);
  }

  async listViews(params: ListViewsDto): Promise<Paginated<View>> {
    const { page, limit, entityId, viewerUserId, from, to, sort } = params;
    const qb = this.viewRepo.createQueryBuilder('view');
    qb.where('view.entity_type = :et', { et: ViewEntityType.Post }).andWhere(
      'view.entity_id = :eid',
      {
        eid: entityId,
      },
    );

    if (viewerUserId) qb.andWhere('view.viewer_user_id = :uid', { uid: viewerUserId });

    if (from) qb.andWhere('view.created_at >= :from', { from: new Date(from) });

    if (to) qb.andWhere('view.created_at <= :to', { to: new Date(to) });

    this.applyViewSort(qb, sort ?? 'created_at_desc');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async countViewsByPost(entityId: number): Promise<number> {
    return this.viewRepo.count({
      where: { entity_type: ViewEntityType.Post, entity_id: entityId },
    });
  }
}
