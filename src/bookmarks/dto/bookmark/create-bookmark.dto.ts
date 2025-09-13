import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookmarkDto {
  @ApiProperty({ example: 123, description: 'ID del post', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId!: number;

  @ApiPropertyOptional({ example: 42, description: 'ID de usuario (opcional)' })
  @Type(() => Number)
  @IsOptional()
  @ValidateIf((dto) => (dto as CreateBookmarkDto).sessionId === undefined)
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({ example: 'anon-abc123', description: 'ID de sesión anónima (opcional)' })
  @IsOptional()
  @ValidateIf((dto) => (dto as CreateBookmarkDto).userId === undefined)
  @IsString()
  @MaxLength(200)
  sessionId?: string;
}
