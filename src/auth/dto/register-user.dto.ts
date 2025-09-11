import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;
}
