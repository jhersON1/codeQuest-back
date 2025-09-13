import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post as HttpPost,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { ListPostsDto } from '../dto/post/list-posts.dto';
import { UpdatePostDto } from '../dto/post/update-post.dto';

@ApiTags('content-management')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost('')
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get('')
  list(@Query() query: ListPostsDto) {
    return this.postsService.list(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.delete(id);
  }
}
