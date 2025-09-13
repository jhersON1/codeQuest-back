import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { FollowEntityType } from '../../entities/follow/follow.entity';

export class CreateFollowDto {
  @ApiProperty({ example: 42, description: 'ID del usuario que sigue', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  followerUserId!: number;

  @ApiProperty({
    example: 'post',
    enum: FollowEntityType,
    description: 'Tipo de entidad a seguir',
  })
  @IsEnum(FollowEntityType)
  entityType!: FollowEntityType;

  @ApiProperty({ example: 123, description: 'ID de la entidad seguida', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entityId!: number;
}
