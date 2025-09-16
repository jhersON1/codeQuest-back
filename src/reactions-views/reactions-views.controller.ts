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
import { ReactionsViewsService } from './reactions-views.service';
import { CreateReactionDto } from './dto/reaction/create-reaction.dto';
import { ListReactionsDto } from './dto/reaction/list-reactions.dto';
import { DeleteReactionDto } from './dto/reaction/delete-reaction.dto';
import { CreateViewDto } from './dto/view/create-view.dto';
import { ListViewsDto } from './dto/view/list-views.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('reactions-views')
@Controller()
export class ReactionsViewsController {
  constructor(private readonly service: ReactionsViewsService) {}

  // Reactions
  @HttpPost('reactions')
  @Auth()
  createReaction(@Body() dto: CreateReactionDto, @GetUser() user: User) {
    return this.service.createReactionForUser(user.user_id, dto);
  }

  @Get('reactions')
  listReactions(@Query() query: ListReactionsDto) {
    return this.service.listReactions(query);
  }

  @Delete('reactions/:id')
  @Auth()
  deleteReactionById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.service.deleteReactionById(id, user.user_id);
  }

  @Delete('reactions')
  @Auth()
  deleteReactionByCombo(@Body() dto: DeleteReactionDto, @GetUser() user: User) {
    return this.service.deleteReaction(dto, user.user_id);
  }

  // Views
  @HttpPost('views')
  createView(@Body() dto: CreateViewDto) {
    return this.service.createView(dto);
  }

  @Get('views')
  listViews(@Query() query: ListViewsDto) {
    return this.service.listViews(query);
  }

  @Get('me/reactions')
  @Auth()
  listMyReactions(@Query() query: ListReactionsDto, @GetUser() user: User) {
    return this.service.listReactions({ ...query, userId: user.user_id } as any);
  }

  @Get('me/views')
  @Auth()
  listMyViews(@Query() query: ListViewsDto, @GetUser() user: User) {
    return this.service.listViews({ ...query, viewerUserId: user.user_id } as any);
  }
}
