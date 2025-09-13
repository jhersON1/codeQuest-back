import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type CategorySort = 'name_asc' | 'name_desc' | 'created_at_desc' | 'created_at_asc';

export class ListCategoriesDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit!: number;

  @ApiPropertyOptional({ example: 'back', description: 'Búsqueda por name/slug (ILIKE)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'created_at_desc', description: 'Orden' })
  @IsOptional()
  @IsString()
  sort?: CategorySort;
}
