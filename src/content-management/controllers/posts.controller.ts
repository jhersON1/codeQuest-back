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
import { Auth } from '../../auth/decorators/auth.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../auth/entities/user.entity';

@ApiTags('content-management')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost('')
  @Auth()
  create(@Body() dto: CreatePostDto, @GetUser() user: User) {
    return this.postsService.create(dto, user.user_id);
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
  @Auth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @GetUser() user: User,
  ) {
    return this.postsService.update(id, dto, user);
  }

  @Delete(':id')
  @Auth()
  delete(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.postsService.delete(id, user);
  }

  @Get('me')
  @Auth()
  listMine(@Query() query: ListPostsDto, @GetUser() user: User) {
    return this.postsService.listMine(user.user_id, query);
  }
}
