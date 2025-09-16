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
import { TagsService } from '../services/tags.service';
import { CreateTagDto } from '../dto/tag/create-tag.dto';
import { ListTagsDto } from '../dto/tag/list-tags.dto';
import { UpdateTagDto } from '../dto/tag/update-tag.dto';
import { Auth } from '../../auth/decorators/auth.decorator';

@ApiTags('content-management')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @HttpPost('')
  @Auth('admin')
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Get('')
  list(@Query() query: ListTagsDto) {
    return this.tagsService.list(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Patch(':id')
  @Auth('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @Delete(':id')
  @Auth('admin')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.delete(id);
  }
}
