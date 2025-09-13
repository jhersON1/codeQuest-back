import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignPostTagsDto {
  @ApiPropertyOptional({ example: [10, 20] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  tagIds?: number[];

  @ApiPropertyOptional({ example: ['typescript', 'nestjs'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagSlugs?: string[];
}
