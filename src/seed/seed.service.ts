import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from '../auth/entities/user.entity';
import { Post } from '../content-management/entities/post/post.entity';
import { Category } from '../content-management/entities/category/category.entity';
import { Tag } from '../content-management/entities/tag/tag.entity';

import { PostsService } from '../content-management/services/posts.service';
import { CategoriesService } from '../content-management/services/categories.service';
import { TagsService } from '../content-management/services/tags.service';
import { SearchService } from '../search/search.service';

import { seedUsers } from './data/seed-users';
import { CreatePostDto } from 'src/content-management/dto/post/create-post.dto';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,

    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly searchService: SearchService,
  ) {}

  async executeSeed() {
    this.logger.log('Initializing seed process...');

    // Clean slate
    await this.clearDatabase();

    // Seed users, categories, and tags
    const users = await this.seedUsers();
    const categories = await this.seedCategories();
    const tags = await this.seedTags();

    // Seed posts and then index them
    await this.seedPostsAndIndex(users, categories, tags);

    this.logger.log('Seed process completed successfully');
    return { message: 'Seed completed successfully' };
  }

  private async clearDatabase() {
    this.logger.log('Clearing database...');
    // Order matters due to foreign key constraints
    await this.postRepository.createQueryBuilder().delete().where({}).execute();
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
    await this.categoryRepository.createQueryBuilder().delete().where({}).execute();
    await this.tagRepository.createQueryBuilder().delete().where({}).execute();
  }

  private async seedUsers(): Promise<User[]> {
    this.logger.log('Seeding users...');
    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => {
        user.password = await argon2.hash(user.password);
        return user;
      }),
    );
    const createdUsers = this.userRepository.create(hashedUsers);
    const savedUsers = await this.userRepository.save(createdUsers);
    this.logger.log(`Created ${savedUsers.length} Users`);
    return savedUsers;
  }

  private async seedCategories(): Promise<Category[]> {
    this.logger.log('Seeding categories...');
    const categories = [
      { name: 'Backend Development', slug: 'backend' },
      { name: 'Frontend Development', slug: 'frontend' },
      { name: 'DevOps', slug: 'devops' },
    ];
    const created = this.categoryRepository.create(categories);
    const saved = await this.categoryRepository.save(created);
    this.logger.log(`Created ${saved.length} Categories`);
    return saved;
  }

  private async seedTags(): Promise<Tag[]> {
    this.logger.log('Seeding tags...');
    const tags = [
      { name: 'NestJS', slug: 'nestjs' },
      { name: 'React', slug: 'react' },
      { name: 'Docker', slug: 'docker' },
      { name: 'TypeScript', slug: 'typescript' },
    ];
    const created = this.tagRepository.create(tags);
    const saved = await this.tagRepository.save(created);
    this.logger.log(`Created ${saved.length} Tags`);
    return saved;
  }

  private async seedPostsAndIndex(users: User[], categories: Category[], tags: Tag[]) {
    this.logger.log('Seeding posts...');
    const adminUser = users.find((u) => u.username === 'admin');

    if (!adminUser) {
      this.logger.error('Admin user not found, cannot seed posts.');
      return;
    }

    const postsToCreate: CreatePostDto[] = [
      {
        title: 'Building a REST API with NestJS',
        body: 'An in-depth guide to creating robust APIs using the NestJS framework, covering modules, controllers, and services.',
        excerpt: 'A comprehensive tutorial on NestJS for backend developers.',
        categorySlugs: ['backend'],
        tagSlugs: ['nestjs', 'typescript'],
      },
      {
        title: 'State Management in React with Redux',
        body: 'Learn how to manage complex application state in React using Redux and the React-Redux library.',
        excerpt: 'A guide to predictable state containers for JS apps.',
        categorySlugs: ['frontend'],
        tagSlugs: ['react', 'typescript'],
      },
      {
        title: 'Containerizing Your App with Docker',
        body: 'This post walks you through creating a Dockerfile for a Node.js application and running it in a container.',
        excerpt: 'An introduction to Docker for modern application deployment.',
        categorySlugs: ['devops', 'backend'],
        tagSlugs: ['docker'],
      },
    ];

    for (const postDto of postsToCreate) {
      await this.postsService.create(postDto, adminUser.user_id);
    }

    this.logger.log(`Created ${postsToCreate.length} posts.`);

    // Indexing logic
    this.logger.log('Indexing posts in Meilisearch...');
    await this.searchService.deleteAllDocuments(); // Clear the index first

    const allPosts = await this.postRepository.find({
      relations: ['postCategories.category', 'postTags.tag'],
    });

    const task = await this.searchService.indexPosts(allPosts);
    this.logger.log(`Meilisearch indexing task started with ID: ${task.taskUid}`);
  }
}
