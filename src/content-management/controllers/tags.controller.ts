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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { CreateTagDto } from '../dto/tag/create-tag.dto';
import { ListTagsDto } from '../dto/tag/list-tags.dto';
import { UpdateTagDto } from '../dto/tag/update-tag.dto';

@ApiTags('content-management')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @HttpPost('')
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Get('')
  @UsePipes(new ValidationPipe({ transform: true }))
  list(@Query() query: ListTagsDto) {
    return this.tagsService.list(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.delete(id);
  }
}
