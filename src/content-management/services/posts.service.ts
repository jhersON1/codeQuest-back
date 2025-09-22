import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post, PostStatus, PostVisibility } from '../entities/post/post.entity';
import { PostCategory } from '../entities/post/post-category.entity';
import { PostTag } from '../entities/post/post-tag.entity';
import { Category } from '../entities/category/category.entity';
import { Tag } from '../entities/tag/tag.entity';
import { Comment, CommentStatus } from '../../comments/entities/comment/comment.entity';
import {
  Reaction,
  ReactionType,
  ReactionEntityType,
} from '../../reactions-views/entities/reaction/reaction.entity';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { UpdatePostDto } from '../dto/post/update-post.dto';
import { ListPostsDto, PostSort } from '../dto/post/list-posts.dto';
import { User } from '../../auth/entities/user.entity';
import { UserRoles } from '../../auth/enums/user-roles.enum';
import { CategoriesService } from './categories.service';
import { TagsService } from './tags.service';
import { SlugService } from './slug.service';
import { SearchService } from 'src/search/search.service';

export type Paginated<T> = {
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
    private readonly searchService: SearchService,
  ) {}

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, hasNextPage: page * limit < total };
  }

  private addCountsTosearchuery(qb: SelectQueryBuilder<Post>) {
    qb.leftJoinAndSelect('post.author', 'author')
      .leftJoin(
        (subsearchuery) =>
          subsearchuery
            .select('comment.post_id', 'post_id')
            .addSelect('COUNT(*)', 'comment_count')
            .from(Comment, 'comment')
            .where('comment.status IN (:...statuses)', {
              statuses: [CommentStatus.Approved, CommentStatus.Pending],
            })
            .andWhere('comment.deleted_at IS NULL')
            .groupBy('comment.post_id'),
        'cc',
        'cc.post_id = post.post_id',
      )
      .leftJoin(
        (subsearchuery) =>
          subsearchuery
            .select('reaction.entity_id', 'entity_id')
            .addSelect('COUNT(*)', 'like_count')
            .from(Reaction, 'reaction')
            .where('reaction.entity_type = :postType', { postType: ReactionEntityType.Post })
            .andWhere('reaction.type = :likeType', { likeType: ReactionType.Like })
            .groupBy('reaction.entity_id'),
        'rc',
        'rc.entity_id = post.post_id',
      )
      .addSelect('COALESCE(cc.comment_count, 0)', 'commentCount')
      .addSelect('COALESCE(rc.like_count, 0)', 'likeCount');

    return qb;
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

  async create(dto: CreatePostDto, authorUserId: string): Promise<Post> {
    const status = dto.status ?? PostStatus.Draft;
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;

    if (status === PostStatus.Published && !publishedAt) {
      throw new BadRequestException('publishedAt es researchuerido cuando status = published');
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
      featured_image_url: dto.featuredImageUrl ?? null,
      author_user_id: authorUserId,
    });

    const saved = await this.postRepo.save(post);

    await this.searchService.indexPosts([post]);

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

  async update(id: number, dto: UpdatePostDto, currentUser: User): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { post_id: id } });

    if (!post) throw new NotFoundException('Post no encontrado');

    const isOwner = post.author_user_id === currentUser.user_id;
    const isAdmin = currentUser.role === UserRoles.ADMIN;

    if (!isOwner && !isAdmin) throw new ForbiddenException('No autorizado');

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

    if (dto.featuredImageUrl !== undefined) post.featured_image_url = dto.featuredImageUrl ?? null;

    const newPublishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;

    if (post.status === PostStatus.Published) {
      const effective = newPublishedAt ?? post.published_at;

      if (!effective)
        throw new BadRequestException('publishedAt es researchuerido cuando status = published');

      post.published_at = effective;
    } else if (newPublishedAt !== undefined) {
      post.published_at = newPublishedAt;
    }

    const updated = await this.postRepo.save(post);

    await this.searchService.indexPosts([post]);

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

  async delete(id: number, currentUser: User): Promise<void> {
    const post = await this.postRepo.findOne({ where: { post_id: id } });

    if (!post) throw new NotFoundException('Post no encontrado');

    const isOwner = post.author_user_id === currentUser.user_id;
    const isAdmin = currentUser.role === UserRoles.ADMIN;

    if (!isOwner && !isAdmin) throw new ForbiddenException('No autorizado');

    await this.postRepo.delete({ post_id: id });
    await this.searchService.deleteDocument(id)
  }

  async list(params: ListPostsDto): Promise<Paginated<Post>> {
    const {
      page,
      limit,
      search,
      status,
      visibility,
      categoryIds,
      categorySlugs,
      tagIds,
      tagSlugs,
      sort,
    } = params;
    const qb = this.postRepo.createQueryBuilder('post');

    // Agregar conteos de comentarios y likes
    this.addCountsTosearchuery(qb);

    if (search)
      qb.andWhere('(post.title ILIKE :search OR post.body ILIKE :search)', {
        search: `%${search}%`,
      });

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

    // Para el conteo total, usamos una consulta separada sin los JOINs de conteo
    const countqb = this.postRepo.createQueryBuilder('post');

    if (search)
      countqb.andWhere('(post.title ILIKE :search OR post.body ILIKE :search)', {
        search: `%${search}%`,
      });

    if (status) countqb.andWhere('post.status = :status', { status });

    if (visibility) countqb.andWhere('post.visibility = :visibility', { visibility });

    // Aplicar los mismos filtros de categorías y tags para el conteo
    if ((categoryIds && categoryIds.length) || (categorySlugs && categorySlugs.length)) {
      countqb.innerJoin(PostCategory, 'pc', 'pc.post_id = post.post_id');

      if (categoryIds && categoryIds.length)
        countqb.andWhere('pc.category_id IN (:...cids)', { cids: categoryIds });

      if (categorySlugs && categorySlugs.length) {
        countqb
          .innerJoin(Category, 'c', 'c.category_id = pc.category_id')
          .andWhere('c.slug IN (:...cslugs)', { cslugs: categorySlugs });
      }
    }

    if ((tagIds && tagIds.length) || (tagSlugs && tagSlugs.length)) {
      countqb.innerJoin(PostTag, 'pt', 'pt.post_id = post.post_id');

      if (tagIds && tagIds.length) countqb.andWhere('pt.tag_id IN (:...tids)', { tids: tagIds });

      if (tagSlugs && tagSlugs.length) {
        countqb.innerJoin(Tag, 't', 't.tag_id = pt.tag_id').andWhere('t.slug IN (:...tslugs)', {
          tslugs: tagSlugs,
        });
      }
    }

    const total = await countqb.getCount();
    const results = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    // Mapear los resultados para incluir los conteos
    const data = results.entities.map((post, index) => {
      const rawRow = results.raw[index] as Record<string, unknown>;
      const commentCount = parseInt(String(rawRow.commentCount)) || 0;
      const likeCount = parseInt(String(rawRow.likeCount)) || 0;
      return { ...post, commentCount, likeCount };
    });

    console.log({ data, meta: this.buildMeta(page, limit, total) });

    return { data, meta: this.buildMeta(page, limit, total) };
  }
  async findByIdsPaginated(postIds: number[], page = 1, limit = 10): Promise<Paginated<Post>> {
    if (!postIds.length) {
      return { data: [], meta: this.buildMeta(page, limit, 0) };
    }

    const qb = this.postRepo.createQueryBuilder('post');
    this.addCountsTosearchuery(qb);

    qb.where('post.post_id IN (:...ids)', { ids: postIds });

    // Puedes agregar relaciones aquí si lo necesitas
    // Ejemplo: qb.leftJoinAndSelect('post.author', 'author');

    this.applyPostSort(qb, 'published_at_desc');

    const total = postIds.length;
    const results = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    const data = results.entities.map((post, index) => {
      const rawRow = results.raw[index] as Record<string, unknown>;
      const commentCount = parseInt(String(rawRow.commentCount)) || 0;
      const likeCount = parseInt(String(rawRow.likeCount)) || 0;
      return { ...post, commentCount, likeCount };
    });

    return { data, meta: this.buildMeta(page, limit, total) };
  }

  async findBySlug(slug: string): Promise<Post> {
    const qb = this.postRepo.createQueryBuilder('post');
    this.addCountsTosearchuery(qb);
    qb.where('post.slug = :slug', { slug });

    const result = await qb.getRawAndEntities();

    if (!result.entities.length) {
      throw new NotFoundException('Post no encontrado');
    }

    const post = result.entities[0];
    const rawRow = result.raw[0] as Record<string, unknown>;
    const commentCount = parseInt(String(rawRow.commentCount)) || 0;
    const likeCount = parseInt(String(rawRow.likeCount)) || 0;

    return { ...post, commentCount, likeCount } as Post;
  }

  async listMine(authorUserId: string, params: ListPostsDto): Promise<Paginated<Post>> {
    const { page, limit, search, status, visibility, sort } = params;
    const qb = this.postRepo.createQueryBuilder('post');

    // Agregar conteos de comentarios y likes
    this.addCountsTosearchuery(qb);

    qb.where('post.author_user_id = :uid', { uid: authorUserId });

    if (search)
      qb.andWhere('(post.title ILIKE :search OR post.body ILIKE :search)', {
        search: `%${search}%`,
      });

    if (status) qb.andWhere('post.status = :status', { status });

    if (visibility) qb.andWhere('post.visibility = :visibility', { visibility });

    this.applyPostSort(qb, sort ?? 'published_at_desc');

    // Para el conteo total, usamos una consulta separada
    const countqb = this.postRepo.createQueryBuilder('post');
    countqb.where('post.author_user_id = :uid', { uid: authorUserId });

    if (search)
      countqb.andWhere('(post.title ILIKE :search OR post.body ILIKE :search)', {
        search: `%${search}%`,
      });

    if (status) countqb.andWhere('post.status = :status', { status });

    if (visibility) countqb.andWhere('post.visibility = :visibility', { visibility });

    const total = await countqb.getCount();
    const results = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    // Mapear los resultados para incluir los conteos
    const data = results.entities.map((post, index) => {
      const rawRow = results.raw[index] as Record<string, unknown>;
      const commentCount = parseInt(String(rawRow.commentCount)) || 0;
      const likeCount = parseInt(String(rawRow.likeCount)) || 0;
      return { ...post, commentCount, likeCount };
    });

    return { data, meta: this.buildMeta(page, limit, total) };
  }
}
