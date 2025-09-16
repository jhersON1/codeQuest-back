import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReactionEntityType, ReactionType } from '../../entities/reaction/reaction.entity';

export type ReactionSort = 'created_at_desc' | 'created_at_asc';

export class ListReactionsDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'Página (>= 1)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, description: 'Límite por página (1-50)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit!: number;

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

  @ApiPropertyOptional({ example: 'uuid-1234' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: 'created_at_desc', description: 'Orden' })
  @IsOptional()
  sort?: ReactionSort;
}
