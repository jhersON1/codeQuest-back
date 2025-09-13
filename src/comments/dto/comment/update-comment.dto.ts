import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CommentStatus } from '../../entities/comment/comment.entity';

export class UpdateCommentDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body?: string;

  @ApiPropertyOptional({ enum: CommentStatus })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}

