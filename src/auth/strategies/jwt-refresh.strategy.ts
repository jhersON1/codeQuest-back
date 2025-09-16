import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { JwtRefreshPayload } from '../interfaces/jwt-refresh-payload';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ||
        (configService.get<string>('JWT_SECRET') as string),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<User> {
    const { user_id } = payload;
    const user = await this.userRepository.findOneBy({ user_id });
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    return user;
  }
}
