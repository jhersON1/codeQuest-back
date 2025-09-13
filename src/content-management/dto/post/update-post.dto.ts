import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, ValidateIf } from 'class-validator';
import { PostStatus } from '../../entities/post/post.entity';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({
    example: '2025-09-12T12:00:00.000Z',
    description: 'Requerido si status = published',
  })
  @ValidateIf((o: UpdatePostDto) => o.status === PostStatus.Published)
  @IsDateString()
  publishedAt?: string;
}
