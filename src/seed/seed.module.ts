import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';
import { User } from '../auth/entities/user.entity';
import { Post } from '../content-management/entities/post/post.entity';
import { Category } from '../content-management/entities/category/category.entity';
import { Tag } from '../content-management/entities/tag/tag.entity';
import { ContentManagementModule } from '../content-management/content-management.module';
import { SearchModule } from '../search/search.module'; // Correctly import SearchModule

@Module({
  imports: [
    AppModule,
    TypeOrmModule.forFeature([User, Post, Category, Tag]),
    ContentManagementModule,
    SearchModule, // Add SearchModule to imports
  ],
  providers: [SeedService],
})
export class SeedModule {}
