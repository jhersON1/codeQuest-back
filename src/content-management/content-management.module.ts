import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { PostsController } from './controllers/posts.controller';
import { CategoriesController } from './controllers/categories.controller';
import { TagsController } from './controllers/tags.controller';
import { PostsService } from './services/posts.service';
import { CategoriesService } from './services/categories.service';
import { TagsService } from './services/tags.service';
import { SlugService } from './services/slug.service';
import { Post } from './entities/post/post.entity';
import { Category } from './entities/category/category.entity';
import { Tag } from './entities/tag/tag.entity';
import { PostCategory } from './entities/post/post-category.entity';
import { PostTag } from './entities/post/post-tag.entity';
import { User } from '../auth/entities/user.entity';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Category, Tag, PostCategory, PostTag, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => SearchModule),
  ],
  controllers: [PostsController, CategoriesController, TagsController],
  providers: [PostsService, CategoriesService, TagsService, SlugService],
  exports: [PostsService, CategoriesService, TagsService, SlugService],
})
export class ContentManagementModule {}
