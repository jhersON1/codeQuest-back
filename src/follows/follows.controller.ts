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
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/follow/create-follow.dto';
import { ListFollowsDto } from './dto/follow/list-follows.dto';
import { DeleteFollowDto } from './dto/follow/delete-follow.dto';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly service: FollowsService) {}

  @HttpPost('')
  create(@Body() dto: CreateFollowDto) {
    return this.service.createFollow(dto);
  }

  @Get('')
  list(@Query() query: ListFollowsDto) {
    return this.service.listFollows(query);
  }

  @Delete(':id')
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeById(id);
  }

  @Delete('')
  deleteByComposite(@Body() dto: DeleteFollowDto) {
    return this.service.removeByComposite(dto);
  }
}
