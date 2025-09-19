import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ViewEntityType } from '../../entities/view/view.entity';

export class CreateViewDto {
  @ApiProperty({ enum: ViewEntityType, example: ViewEntityType.Post })
  @IsEnum(ViewEntityType)
  entityType!: ViewEntityType;

  @ApiProperty({ example: 1, minimum: 1, description: 'post_id' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entityId!: number;

  @ApiPropertyOptional({ example: 'uuid-1234', description: 'viewer_user_id (opcional)' })
  @IsOptional()
  @IsUUID()
  viewerUserId?: string;

  @ApiPropertyOptional({ example: '192.168.0.1' })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({ example: 'browser-fp-abc123' })
  @IsOptional()
  @IsString()
  fingerprint?: string;
}
