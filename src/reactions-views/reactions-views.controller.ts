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

@ApiTags('reactions-views')
@Controller()
export class ReactionsViewsController {
  constructor(private readonly service: ReactionsViewsService) {}

  // Reactions
  @HttpPost('reactions')
  createReaction(@Body() dto: CreateReactionDto) {
    return this.service.createReaction(dto);
  }

  @Get('reactions')
  listReactions(@Query() query: ListReactionsDto) {
    return this.service.listReactions(query);
  }

  @Delete('reactions/:id')
  deleteReactionById(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteReactionById(id);
  }

  @Delete('reactions')
  deleteReactionByCombo(@Body() dto: DeleteReactionDto) {
    return this.service.deleteReaction(dto);
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
}
