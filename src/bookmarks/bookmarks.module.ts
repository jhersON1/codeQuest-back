import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark/bookmark.entity';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark])],
  providers: [BookmarksService],
  controllers: [BookmarksController],
  exports: [BookmarksService],
})
export class BookmarksModule {}
