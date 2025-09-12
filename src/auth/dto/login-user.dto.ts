import { IsString, MinLength, MaxLength } from 'class-validator';
export class LoginUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;
}
