import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-user.dto';

export class UpdateAuthDto extends PartialType(RegisterUserDto) {}
