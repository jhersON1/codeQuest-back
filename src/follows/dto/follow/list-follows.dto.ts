import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { FollowEntityType } from '../../entities/follow/follow.entity';

export type FollowSort = 'created_at_desc' | 'created_at_asc';

export class ListFollowsDto {
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

  @ApiProperty({ example: 'uuid-1234', description: 'ID del usuario cuyos follows se listan' })
  @IsUUID()
  followerUserId!: string;

  @ApiPropertyOptional({
    example: 'category',
    enum: FollowEntityType,
    description: 'Filtrar por tipo',
  })
  @IsOptional()
  @IsEnum(FollowEntityType)
  entityType?: FollowEntityType;

  @ApiPropertyOptional({ example: 7, description: 'Filtrar por ID de la entidad seguida' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  entityId?: number;

  @ApiPropertyOptional({ example: 'created_at_desc', description: 'Orden' })
  @IsOptional()
  sort?: FollowSort;
}
