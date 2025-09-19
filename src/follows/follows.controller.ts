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
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly service: FollowsService) {}

  @HttpPost('')
  @Auth()
  create(@Body() dto: CreateFollowDto, @GetUser() user: User) {
    return this.service.createFollowForUser(user.user_id, dto.entityType, dto.entityId);
  }

  @Get('')
  list(@Query() query: ListFollowsDto) {
    return this.service.listFollows(query);
  }

  @Delete(':id')
  @Auth()
  deleteById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.service.removeById(id, user.user_id);
  }

  @Delete('')
  @Auth()
  deleteByComposite(@Body() dto: DeleteFollowDto, @GetUser() user: User) {
    return this.service.removeByCompositeForUser(user.user_id, dto.entityType, dto.entityId);
  }

  @Get('me')
  @Auth()
  listMine(@Query() query: ListFollowsDto, @GetUser() user: User) {
    return this.service.listFollows({ ...query, followerUserId: user.user_id });
  }
}
