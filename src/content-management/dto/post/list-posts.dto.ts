import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PostStatus, PostVisibility } from '../../entities/post/post.entity';

export type PostSort =
  | 'published_at_desc'
  | 'published_at_asc'
  | 'created_at_desc'
  | 'created_at_asc';

export class ListPostsDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'Página (≥ 1)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, description: 'Límite por página (1–50)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit!: number;

  @ApiPropertyOptional({ example: 'nestjs', description: 'Búsqueda por título/cuerpo (ILIKE)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PostStatus, example: PostStatus.Published })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ enum: PostVisibility, example: PostVisibility.Public })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)];
  })
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ example: ['backend', 'node'] })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  categorySlugs?: string[];

  @ApiPropertyOptional({ example: [10, 20] })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)];
  })
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional({ example: ['nestjs', 'orm'] })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  tagSlugs?: string[];

  @ApiPropertyOptional({ example: 'published_at_desc', description: 'Orden' })
  @IsOptional()
  @IsString()
  sort?: PostSort;
}
