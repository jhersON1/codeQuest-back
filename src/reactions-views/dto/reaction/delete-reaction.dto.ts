import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReactionEntityType, ReactionType } from '../../entities/reaction/reaction.entity';

export class DeleteReactionDto {
  @ApiPropertyOptional({ example: 123, description: 'reaction_id a eliminar' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  reactionId?: number;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({ enum: ReactionEntityType })
  @IsOptional()
  @IsEnum(ReactionEntityType)
  entityType?: ReactionEntityType;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  entityId?: number;

  @ApiPropertyOptional({ enum: ReactionType })
  @IsOptional()
  @IsEnum(ReactionType)
  type?: ReactionType;
}
