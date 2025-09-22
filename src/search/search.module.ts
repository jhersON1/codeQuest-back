import { forwardRef, Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/content-management/entities/post/post.entity';
import { ContentManagementModule } from 'src/content-management/content-management.module';

@Module({
  imports: [
    MeilisearchModule,
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => ContentManagementModule),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
