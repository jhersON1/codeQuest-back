import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ example: 1, description: 'ID del post', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId!: number;

  @ApiPropertyOptional({ example: 10, description: 'ID del comentario padre' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  parentCommentId?: number;

  @ApiProperty({ example: 'Buen artículo!', minLength: 1, maxLength: 5000 })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;
}
