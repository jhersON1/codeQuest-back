import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { JwtPayload } from './interfaces/jwt-payload';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const { password, ...rest } = registerUserDto;

      const user = this.userRepository.create({
        ...rest,
        password: await argon2.hash(password),
      });

      await this.userRepository.save(user);

      return {
        token: this.generateJwt({ user_id: user.user_id }),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An error has ocurred');
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, username } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { username },
      select: { user_id: true, password: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    if (!(await argon2.verify(user.password, password)))
      throw new UnauthorizedException('Invalid credentials');

    return {
      token: this.generateJwt({ user_id: user.user_id }),
    };
  }

  generateJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
