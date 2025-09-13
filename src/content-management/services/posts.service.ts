import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post, PostStatus, PostVisibility } from '../entities/post/post.entity';
import { PostCategory } from '../entities/post/post-category.entity';
import { PostTag } from '../entities/post/post-tag.entity';
import { Category } from '../entities/category/category.entity';
import { Tag } from '../entities/tag/tag.entity';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { UpdatePostDto } from '../dto/post/update-post.dto';
import { ListPostsDto, PostSort } from '../dto/post/list-posts.dto';
import { CategoriesService } from './categories.service';
import { TagsService } from './tags.service';
import { SlugService } from './slug.service';

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(PostCategory) private readonly postCategoryRepo: Repository<PostCategory>,
    @InjectRepository(PostTag) private readonly postTagRepo: Repository<PostTag>,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly slugService: SlugService,
  ) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private applyPostSort(qb: SelectQueryBuilder<Post>, sort?: PostSort) {
    switch (sort) {
      case 'published_at_asc':
        qb.addOrderBy('post.published_at', 'ASC', 'NULLS LAST').addOrderBy(
          'post.created_at',
          'ASC',
        );
        break;
      case 'created_at_desc':
        qb.addOrderBy('post.created_at', 'DESC');
        break;
      case 'created_at_asc':
        qb.addOrderBy('post.created_at', 'ASC');
        break;
      case 'published_at_desc':
      default:
        qb.addOrderBy('post.published_at', 'DESC', 'NULLS LAST').addOrderBy(
          'post.created_at',
          'DESC',
        );
        break;
    }
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const status = dto.status ?? PostStatus.Draft;
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    if (status === PostStatus.Published && !publishedAt) {
      throw new BadRequestException('publishedAt es requerido cuando status = published');
    }

    const slug = await this.slugService.generateUniqueSlug(dto.title, this.postRepo);
    const post = this.postRepo.create({
      title: dto.title,
      slug,
      excerpt: dto.excerpt ?? null,
      body: dto.body,
      status,
      published_at: publishedAt,
      visibility: dto.visibility ?? PostVisibility.Public,
      cover_image_id: dto.coverImageId ?? null,
    });
    const saved = await this.postRepo.save(post);

    const categories = await this.categoriesService.resolveByRefs({
      categoryIds: dto.categoryIds,
      categorySlugs: dto.categorySlugs,
    });
    const tags = await this.tagsService.resolveByRefs({
      tagIds: dto.tagIds,
      tagSlugs: dto.tagSlugs,
    });
    if (categories.length) {
      await this.postCategoryRepo.save(
        categories.map((c) => ({ post_id: saved.post_id, category_id: c.category_id })),
      );
    }
    if (tags.length) {
      await this.postTagRepo.save(tags.map((t) => ({ post_id: saved.post_id, tag_id: t.tag_id })));
    }
    return saved;
  }

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { post_id: id } });
    if (!post) throw new NotFoundException('Post no encontrado');

    if (dto.title && dto.title !== post.title) {
      post.title = dto.title;
      post.slug = await this.slugService.generateUniqueSlug(
        dto.title,
        this.postRepo,
        'post_id',
        post.post_id,
      );
    }
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt ?? null;
    if (dto.body !== undefined) post.body = dto.body;
    if (dto.status !== undefined) post.status = dto.status;
    if (dto.visibility !== undefined) post.visibility = dto.visibility;
    if (dto.coverImageId !== undefined) post.cover_image_id = dto.coverImageId ?? null;

    const newPublishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
    if (post.status === PostStatus.Published) {
      const effective = newPublishedAt ?? post.published_at;
      if (!effective)
        throw new BadRequestException('publishedAt es requerido cuando status = published');
      post.published_at = effective;
    } else if (newPublishedAt !== undefined) {
      post.published_at = newPublishedAt;
    }

    const updated = await this.postRepo.save(post);

    const hasCatRefs = dto.categoryIds !== undefined || dto.categorySlugs !== undefined;
    const hasTagRefs = dto.tagIds !== undefined || dto.tagSlugs !== undefined;
    if (hasCatRefs) {
      await this.postCategoryRepo.delete({ post_id: updated.post_id });
      const categories = await this.categoriesService.resolveByRefs({
        categoryIds: dto.categoryIds,
        categorySlugs: dto.categorySlugs,
      });
      if (categories.length) {
        await this.postCategoryRepo.save(
          categories.map((c) => ({ post_id: updated.post_id, category_id: c.category_id })),
        );
      }
    }
    if (hasTagRefs) {
      await this.postTagRepo.delete({ post_id: updated.post_id });
      const tags = await this.tagsService.resolveByRefs({
        tagIds: dto.tagIds,
        tagSlugs: dto.tagSlugs,
      });
      if (tags.length) {
        await this.postTagRepo.save(
          tags.map((t) => ({ post_id: updated.post_id, tag_id: t.tag_id })),
        );
      }
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const result = await this.postRepo.delete({ post_id: id });
    if (!result.affected) throw new NotFoundException('Post no encontrado');
  }

  async list(params: ListPostsDto): Promise<Paginated<Post>> {
    const {
      page,
      limit,
      q,
      status,
      visibility,
      categoryIds,
      categorySlugs,
      tagIds,
      tagSlugs,
      sort,
    } = params;
    const qb = this.postRepo.createQueryBuilder('post');
    if (q) qb.andWhere('(post.title ILIKE :q OR post.body ILIKE :q)', { q: `%${q}%` });
    if (status) qb.andWhere('post.status = :status', { status });
    if (visibility) qb.andWhere('post.visibility = :visibility', { visibility });

    if ((categoryIds && categoryIds.length) || (categorySlugs && categorySlugs.length)) {
      qb.innerJoin(PostCategory, 'pc', 'pc.post_id = post.post_id');
      if (categoryIds && categoryIds.length)
        qb.andWhere('pc.category_id IN (:...cids)', { cids: categoryIds });
      if (categorySlugs && categorySlugs.length) {
        qb.innerJoin(Category, 'c', 'c.category_id = pc.category_id').andWhere(
          'c.slug IN (:...cslugs)',
          {
            cslugs: categorySlugs,
          },
        );
      }
    }
    if ((tagIds && tagIds.length) || (tagSlugs && tagSlugs.length)) {
      qb.innerJoin(PostTag, 'pt', 'pt.post_id = post.post_id');
      if (tagIds && tagIds.length) qb.andWhere('pt.tag_id IN (:...tids)', { tids: tagIds });
      if (tagSlugs && tagSlugs.length) {
        qb.innerJoin(Tag, 't', 't.tag_id = pt.tag_id').andWhere('t.slug IN (:...tslugs)', {
          tslugs: tagSlugs,
        });
      }
    }
    this.applyPostSort(qb, sort ?? 'published_at_desc');
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('Post no encontrado');
    return post;
  }
}
