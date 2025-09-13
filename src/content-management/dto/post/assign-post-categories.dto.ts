import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignPostCategoriesDto {
  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ example: ['backend', 'node'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categorySlugs?: string[];
}
