import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CommentStatus } from '../../entities/comment/comment.entity';

export type CommentSort = 'created_at_desc' | 'created_at_asc';

export class ListCommentsDto {
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

  @ApiProperty({ example: 1, description: 'ID del post', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId!: number;

  @ApiPropertyOptional({ example: 5, description: 'ID del comentario padre' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  parentCommentId?: number;

  @ApiPropertyOptional({ enum: CommentStatus })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @ApiPropertyOptional({ example: 'created_at_desc', description: 'Orden' })
  @IsOptional()
  @IsString()
  sort?: CommentSort;
}

