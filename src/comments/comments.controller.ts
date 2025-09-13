import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post as HttpPost, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment/create-comment.dto';
import { ListCommentsDto } from './dto/comment/list-comments.dto';
import { UpdateCommentDto } from './dto/comment/update-comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @HttpPost('')
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Get('')
  list(@Query() query: ListCommentsDto) {
    return this.commentsService.list(query);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.softDelete(id);
  }
}

