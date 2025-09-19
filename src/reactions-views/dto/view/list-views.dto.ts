import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type ViewSort = 'created_at_desc' | 'created_at_asc';

export class ListViewsDto {
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

  @ApiProperty({ example: 1, description: 'post_id (entityId) requerido' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entityId!: number;

  @ApiPropertyOptional({ example: 'uuid-1234' })
  @IsOptional()
  @IsUUID()
  viewerUserId?: string;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2025-01-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: 'created_at_desc' })
  @IsOptional()
  sort?: ViewSort;
}
