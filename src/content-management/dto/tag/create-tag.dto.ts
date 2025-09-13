import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'NestJS' })
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiPropertyOptional({ example: 'nestjs' })
  @IsOptional()
  @IsString()
  slug?: string;
}
