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
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('bookmarks')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly service: BookmarksService) {}

  @HttpPost('')
  @Auth()
  create(@Body() dto: CreateBookmarkDto, @GetUser() user: User) {
    return this.service.createForUser(user.user_id, dto.postId);
  }

  @Get('')
  list(@Query() query: ListBookmarksDto) {
    return this.service.listBookmarks(query);
  }

  @Delete(':id')
  @Auth()
  deleteById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.service.deleteByIdForUser(id, user.user_id);
  }

  @Delete('')
  @Auth()
  deleteByComposite(@Body() dto: DeleteBookmarkDto, @GetUser() user: User) {
    return this.service.deleteByCompositeForUser(user.user_id, dto.postId);
  }

  @Get('me')
  @Auth()
  listMine(@Query() query: ListBookmarksDto, @GetUser() user: User) {
    return this.service.listBookmarks({ ...query, userId: user.user_id } as any);
  }
}
