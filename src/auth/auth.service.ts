import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as argon2 from 'argon2';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const { password, ...rest } = registerUserDto;

      const user = this.userRepository.create({
        ...rest,
        password: await argon2.hash(password),
      });

      await this.userRepository.save(user);

      return 'usuario creado';
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An error has ocurred');
    }
  }

  loginUser(loginUserDto: LoginUserDto) {
    return loginUserDto;
  }
}
