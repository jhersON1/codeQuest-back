import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction/reaction.entity';
import { View } from './entities/view/view.entity';
import { ReactionsViewsService } from './reactions-views.service';
import { ReactionsViewsController } from './reactions-views.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, View])],
  controllers: [ReactionsViewsController],
  providers: [ReactionsViewsService],
  exports: [ReactionsViewsService],
})
export class ReactionsViewsModule {}
