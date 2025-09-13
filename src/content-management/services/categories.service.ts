import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder, FindOptionsWhere } from 'typeorm';
import { Category } from '../entities/category/category.entity';
import { CreateCategoryDto } from '../dto/category/create-category.dto';
import { UpdateCategoryDto } from '../dto/category/update-category.dto';
import { ListCategoriesDto, CategorySort } from '../dto/category/list-categories.dto';
import { SlugService } from './slug.service';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly slugService: SlugService,
  ) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applyCategorySort(qb: SelectQueryBuilder<Category>, sort?: CategorySort) {
    switch (sort) {
      case 'name_asc':
        qb.addOrderBy('category.name', 'ASC');
        break;
      case 'name_desc':
        qb.addOrderBy('category.name', 'DESC');
        break;
      case 'created_at_asc':
        qb.addOrderBy('category.created_at', 'ASC');
        break;
      case 'created_at_desc':
      default:
        qb.addOrderBy('category.created_at', 'DESC');
        break;
    }
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const base = dto.slug || dto.name;
    const slug = await this.slugService.generateUniqueSlug(base, this.categoryRepo);
    const category = this.categoryRepo.create({ name: dto.name, slug });
    return this.categoryRepo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { category_id: id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) {
      category.slug = await this.slugService.generateUniqueSlug(
        dto.slug || category.name,
        this.categoryRepo,
        'category_id',
        id,
      );
    }
    return this.categoryRepo.save(category);
  }

  async delete(id: number): Promise<void> {
    const result = await this.categoryRepo.delete({ category_id: id });
    if (!result.affected) throw new NotFoundException('Categoría no encontrada');
  }

  async list(params: ListCategoriesDto): Promise<Paginated<Category>> {
    const { page, limit, q, sort } = params;
    const qb = this.categoryRepo.createQueryBuilder('category');
    if (q) qb.andWhere('(category.name ILIKE :q OR category.slug ILIKE :q)', { q: `%${q}%` });
    this.applyCategorySort(qb, sort ?? 'created_at_desc');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { slug } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async resolveByRefs(refs: {
    categoryIds?: number[];
    categorySlugs?: string[];
  }): Promise<Category[]> {
    const ids = Array.from(new Set(refs.categoryIds ?? []));
    const slugs = Array.from(new Set((refs.categorySlugs ?? []).map((s) => s.toLowerCase())));
    if (ids.length === 0 && slugs.length === 0) return [];

    const wheres: FindOptionsWhere<Category>[] = [];
    if (ids.length) wheres.push({ category_id: In(ids) });
    if (slugs.length) wheres.push({ slug: In(slugs) });
    const found = await this.categoryRepo.find({ where: wheres });

    const foundIds = new Set(found.map((c) => c.category_id));
    const foundSlugs = new Set(found.map((c) => c.slug));
    const missingIds = ids.filter((id) => !foundIds.has(id));
    const missingSlugs = slugs.filter((s) => !foundSlugs.has(s));
    if (missingIds.length || missingSlugs.length) {
      throw new BadRequestException({
        message: 'Categorías no encontradas',
        missingIds,
        missingSlugs,
      });
    }
    return found;
  }
}
