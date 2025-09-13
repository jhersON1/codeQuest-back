import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReactionEntityType, ReactionType } from '../../entities/reaction/reaction.entity';

export class CreateReactionDto {
  @ApiProperty({ enum: ReactionEntityType, example: ReactionEntityType.Post })
  @IsEnum(ReactionEntityType)
  entityType!: ReactionEntityType;

  @ApiProperty({ example: 1, minimum: 1, description: 'Entity ID (post_id o comment_id)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entityId!: number;

  @ApiProperty({ enum: ReactionType, example: ReactionType.Like })
  @IsEnum(ReactionType)
  type!: ReactionType;

  @ApiPropertyOptional({ example: 10, description: 'ID de usuario (opcional)' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;
}
