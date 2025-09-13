import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder, FindOptionsWhere } from 'typeorm';
import { Tag } from '../entities/tag/tag.entity';
import { CreateTagDto } from '../dto/tag/create-tag.dto';
import { UpdateTagDto } from '../dto/tag/update-tag.dto';
import { ListTagsDto, TagSort } from '../dto/tag/list-tags.dto';
import { SlugService } from './slug.service';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    private readonly slugService: SlugService,
  ) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applyTagSort(qb: SelectQueryBuilder<Tag>, sort?: TagSort) {
    switch (sort) {
      case 'name_asc':
        qb.addOrderBy('tag.name', 'ASC');
        break;
      case 'name_desc':
        qb.addOrderBy('tag.name', 'DESC');
        break;
      case 'created_at_asc':
        qb.addOrderBy('tag.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        qb.addOrderBy('tag.created_at', 'DESC');
        break;
    }
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const base = dto.slug || dto.name;
    const slug = await this.slugService.generateUniqueSlug(base, this.tagRepo);
    const tag = this.tagRepo.create({ name: dto.name, slug });
    return this.tagRepo.save(tag);
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepo.findOne({ where: { tag_id: id } });

    if (!tag) throw new NotFoundException('Tag no encontrado');

    if (dto.name !== undefined) tag.name = dto.name;

    if (dto.slug !== undefined) {
      tag.slug = await this.slugService.generateUniqueSlug(
        dto.slug || tag.name,
        this.tagRepo,
        'tag_id',
        id,
      );
    }

    return this.tagRepo.save(tag);
  }

  async delete(id: number): Promise<void> {
    const result = await this.tagRepo.delete({ tag_id: id });

    if (!result.affected) throw new NotFoundException('Tag no encontrado');
  }

  async list(params: ListTagsDto): Promise<Paginated<Tag>> {
    const { page, limit, q, sort } = params;
    const qb = this.tagRepo.createQueryBuilder('tag');

    if (q) qb.andWhere('(tag.name ILIKE :q OR tag.slug ILIKE :q)', { q: `%${q}%` });

    this.applyTagSort(qb, sort ?? 'created_at_desc');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({ where: { slug } });

    if (!tag) throw new NotFoundException('Tag no encontrado');

    return tag;
  }

  async resolveByRefs(refs: { tagIds?: number[]; tagSlugs?: string[] }): Promise<Tag[]> {
    const ids = Array.from(new Set(refs.tagIds ?? []));
    const slugs = Array.from(new Set((refs.tagSlugs ?? []).map((s) => s.toLowerCase())));

    if (ids.length === 0 && slugs.length === 0) return [];

    const wheres: FindOptionsWhere<Tag>[] = [];

    if (ids.length) wheres.push({ tag_id: In(ids) });

    if (slugs.length) wheres.push({ slug: In(slugs) });

    const found = await this.tagRepo.find({ where: wheres });

    const foundIds = new Set(found.map((t) => t.tag_id));
    const foundSlugs = new Set(found.map((t) => t.slug));
    const missingIds = ids.filter((id) => !foundIds.has(id));
    const missingSlugs = slugs.filter((s) => !foundSlugs.has(s));

    if (missingIds.length || missingSlugs.length) {
      throw new BadRequestException({
        message: 'Tags no encontrados',
        missingIds,
        missingSlugs,
      });
    }

    return found;
  }
}
