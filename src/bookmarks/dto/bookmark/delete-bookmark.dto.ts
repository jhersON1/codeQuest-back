import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteBookmarkDto {
  @ApiProperty({ example: 123, description: 'ID del post', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId!: number;

  @ApiPropertyOptional({
    example: 'uuid-1234',
    description: 'ID de usuario (uno requerido junto a postId)',
  })
  @IsOptional()
  @ValidateIf((dto) => (dto as DeleteBookmarkDto).sessionId === undefined)
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    example: 'anon-abc123',
    description: 'ID de sesión anónima (uno requerido junto a postId)',
  })
  @IsOptional()
  @ValidateIf((dto) => (dto as DeleteBookmarkDto).userId === undefined)
  @IsString()
  @MaxLength(200)
  sessionId?: string;
}
