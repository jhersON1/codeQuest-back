import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { FollowEntityType } from '../../entities/follow/follow.entity';

export class DeleteFollowDto {
  @ApiProperty({ example: 'uuid-1234', description: 'ID del usuario que sigue' })
  @IsUUID()
  followerUserId!: string;

  @ApiProperty({ example: 'user', enum: FollowEntityType, description: 'Tipo de entidad' })
  @IsEnum(FollowEntityType)
  entityType!: FollowEntityType;

  @ApiProperty({ example: 123, description: 'ID de la entidad seguida', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entityId!: number;
}
