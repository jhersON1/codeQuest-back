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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment/create-comment.dto';
import { ListCommentsDto } from './dto/comment/list-comments.dto';
import { UpdateCommentDto } from './dto/comment/update-comment.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @HttpPost('')
  @Auth()
  create(@Body() dto: CreateCommentDto, @GetUser() user: User) {
    return this.commentsService.create(dto, user);
  }

  @Get('')
  list(@Query() query: ListCommentsDto) {
    return this.commentsService.list(query);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentsService.update(id, dto, user);
  }

  @Delete(':id')
  @Auth()
  delete(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.commentsService.softDelete(id, user);
  }

  @Get('me/mine')
  @Auth()
  listMine(@Query() query: ListCommentsDto, @GetUser() user: User) {
    return this.commentsService.listMine(user.user_id, query);
  }
}
