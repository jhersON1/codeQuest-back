import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostStatus, PostVisibility } from '../../entities/post/post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'Cómo empezar con NestJS', minLength: 5, maxLength: 180 })
  @IsString()
  @Length(5, 180)
  title!: string;

  @ApiPropertyOptional({ example: 'Una guía rápida para iniciar con NestJS', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @ApiProperty({ example: 'Contenido completo del artículo en formato Markdown.' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ enum: PostStatus, example: PostStatus.Draft })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    example: '2025-09-12T12:00:00.000Z',
    description: 'Requerido si status = published',
  })
  @ValidateIf((o: CreatePostDto) => o.status === PostStatus.Published)
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ enum: PostVisibility, example: PostVisibility.Public })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ example: 123, description: 'ID de media (opcional)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coverImageId?: number;

  @ApiPropertyOptional({
    example: 'http://localhost:3000/uploads/your-image.jpg',
    description: 'URL absoluta a la imagen destacada (opcional)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @ValidateIf((o) => !o?.coverImageId)
  featuredImageUrl?: string;

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'IDs de categorías' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ example: ['backend', 'nestjs'], description: 'Slugs de categorías' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categorySlugs?: string[];

  @ApiPropertyOptional({ example: [10, 11], description: 'IDs de tags' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional({ example: ['typescript', 'orm'], description: 'Slugs de tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagSlugs?: string[];
}
