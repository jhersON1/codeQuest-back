import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post as HttpPost,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/bookmark/create-bookmark.dto';
import { ListBookmarksDto } from './dto/bookmark/list-bookmarks.dto';
import { DeleteBookmarkDto } from './dto/bookmark/delete-bookmark.dto';

@ApiTags('bookmarks')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly service: BookmarksService) {}

  @HttpPost('')
  create(@Body() dto: CreateBookmarkDto) {
    return this.service.createBookmark(dto);
  }

  @Get('')
  list(@Query() query: ListBookmarksDto) {
    return this.service.listBookmarks(query);
  }

  @Delete(':id')
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteById(id);
  }

  @Delete('')
  deleteByComposite(@Body() dto: DeleteBookmarkDto) {
    return this.service.deleteByComposite(dto);
  }
}
