import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { MeiliSearch, Index, SearchParams, EnqueuedTaskPromise } from 'meilisearch';
import { Post } from 'src/content-management/entities/post/post.entity';
import { SearchPostsDto } from './dto/search.dto';
import { PostsService } from 'src/content-management/services/posts.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly index: Index;

  constructor(
    @Inject('MEILISEARCH_CLIENT') private readonly meilisearch: MeiliSearch,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService
  ) {
    this.index = this.meilisearch.index('posts');
  }

  async onModuleInit() {
    await this.updateIndexSettings();
  }

  async updateIndexSettings() {
    await this.index.updateFilterableAttributes(['categories', 'tags']);

  }

  async indexPosts(posts: Post[]) {
    const documents: Post[] = posts.map((post) => ({
      ...post,
      categories: post.postCategories?.map((pc) => pc.category.slug) || [],
      tags: post.postTags?.map((pt) => pt.tag.slug) || [],
    }));

    return await this.index.addDocuments(documents, { primaryKey: 'post_id' });
  }

  async search(queryParams: SearchPostsDto) {
    const {
      search = '',
      categoryId,
      tagId,
      authorId,
      status,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = queryParams;

    const filters: string[] = [];

    if (categoryId) {
      filters.push(`categories = "${categoryId}"`);
    }
    if (tagId) {
      filters.push(`tags = "${tagId}"`);
    }
    if (authorId) {
      filters.push(`author_user_id = "${authorId}"`);
    }
    if (status) {
      filters.push(`status = "${status}"`);
    }

    const searchParams: SearchParams = {
      filter: filters.length ? filters.join(' AND ') : undefined,
      sort: sortBy ? [`${sortBy}:${sortOrder ?? 'asc'}`] : undefined,
      offset: (page - 1) * limit,
      limit,
    };

    const result = await this.index.search(search, searchParams);

    console.log(result.hits)

    return result.hits
  }
  async searchAndFetchFullPosts(queryParams: SearchPostsDto) {
    const {
      search = '',
      categoryId,
      tagId,
      authorId,
      status,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = queryParams;

    const filters: string[] = [];
    if (categoryId) filters.push(`categories = "${categoryId}"`);
    if (tagId) filters.push(`tags = "${tagId}"`);
    if (authorId) filters.push(`author_user_id = "${authorId}"`);
    if (status) filters.push(`status = "${status}"`);

    const searchParams: SearchParams = {
      filter: filters.length ? filters.join(' AND ') : undefined,
      sort: sortBy ? [`${sortBy}:${sortOrder ?? 'asc'}`] : undefined,
      offset: (page - 1) * limit,
      limit,
    };

    const result = await this.index.search(search, searchParams);

    const postIds = result.hits.map(hit => hit.post_id);

    if (!postIds.length) {
      return { data: [], meta: { page, limit, total: 0, hasNextPage: false } };
    }

    const { data, meta } = await this.postsService.findByIdsPaginated(postIds, page, limit)

    const postsWithoutSensible: Post[] = data.map((post) => {
      const { author } = post
      author.password = undefined
      author.email = ""
      return { ...post, author }
    })

    return {data: postsWithoutSensible, meta};
  }
  deleteAllDocuments(): EnqueuedTaskPromise {
    return this.index.deleteAllDocuments();
  }
  async deleteDocument(documentId: number | number) {
    return await this.index.deleteDocument(documentId);
  }
}
