import {
  ConflictException,
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
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { OAuthAccount } from './entities/oauth-account.entity';
import { JwtRefreshPayload } from './interfaces/jwt-refresh-payload';
import { randomUUID } from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(OAuthAccount)
    private readonly oauthAccountRepo: Repository<OAuthAccount>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async hashToken(token: string) {
    return argon2.hash(token);
  }

  private accessTokenExpiresIn(): string {
    return this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m';
  }

  private refreshTokenExpiresIn(): string {
    return this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '30d';
  }

  private refreshTokenSecret(): string {
    return (
      this.config.get<string>('JWT_REFRESH_SECRET') ||
      (this.config.get<string>('JWT_SECRET') as string)
    );
  }

  private calcExpiryDate(expiresIn: string): Date {
    // Simple parser for s/m/h/d (e.g., 15m, 1h, 7d)
    const match = /^([0-9]+)([smhd])$/.exec(expiresIn);
    const now = new Date();

    if (!match) return new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // default 30d

    const val = parseInt(match[1], 10);
    const unit = match[2];
    const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
    return new Date(now.getTime() + val * mult * 1000);
  }

  private signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiresIn(),
    });
  }

  private async signAndStoreRefreshToken(userId: string): Promise<string> {
    const jti = randomUUID();
    const payload: JwtRefreshPayload = { user_id: userId, jti };
    const token = this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret(),
      expiresIn: this.refreshTokenExpiresIn(),
    });

    const tokenHash = await this.hashToken(token);
    const expiresAt = this.calcExpiryDate(this.refreshTokenExpiresIn());
    const record = this.refreshTokenRepo.create({
      id: jti,
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked_at: null,
    });
    await this.refreshTokenRepo.save(record);
    return token;
  }

  issueAccessToken(userId: string): string {
    return this.signAccessToken({ user_id: userId });
  }

  async issueRefreshToken(userId: string) {
    return this.signAndStoreRefreshToken(userId);
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const { password, ...rest } = registerUserDto;

      const user = this.userRepository.create({
        ...rest,
        password: await argon2.hash(password),
      });

      await this.userRepository.save(user);

      const accessToken = this.issueAccessToken(user.user_id);
      const refreshToken = await this.issueRefreshToken(user.user_id);
      return { token: accessToken, accessToken, refreshToken };
    } catch (error: unknown) {
      // Postgres unique violation
      const code =
        typeof error === 'object' && error && 'code' in error
          ? (error as { code?: unknown }).code
          : undefined;

      if (typeof code === 'string' && code === '23505') {
        throw new ConflictException('Duplicate key');
      }

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

    if (!(await argon2.verify(user.password as string, password)))
      throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.issueAccessToken(user.user_id);
    const refreshToken = await this.issueRefreshToken(user.user_id);
    return { token: accessToken, accessToken, refreshToken };
  }

  async findOrCreateUserFromOAuth(params: {
    provider: string;
    providerUserId: string;
    suggestedUsername?: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: Date | null;
  }): Promise<User> {
    const { provider, providerUserId, suggestedUsername, accessToken, refreshToken, expiresAt } =
      params;

    const existing = await this.oauthAccountRepo.findOne({
      where: { provider, provider_user_id: providerUserId },
    });

    if (existing) {
      // Update tokens if changed
      let needsUpdate = false;

      if (existing.access_token !== (accessToken ?? null)) {
        existing.access_token = accessToken ?? null;
        needsUpdate = true;
      }

      if (existing.refresh_token !== (refreshToken ?? null)) {
        existing.refresh_token = refreshToken ?? null;
        needsUpdate = true;
      }

      if (existing.expires_at?.getTime() !== (expiresAt ?? null)?.getTime()) {
        existing.expires_at = expiresAt ?? null;
        needsUpdate = true;
      }

      if (needsUpdate) await this.oauthAccountRepo.save(existing);

      const user = await this.userRepository.findOneBy({ user_id: existing.user_id });

      if (!user) throw new InternalServerErrorException('OAuth linked user not found');

      return user;
    }

    // Create new user with unique username disambiguation
    const base =
      suggestedUsername && suggestedUsername.trim().length > 0 ? suggestedUsername.trim() : 'user';
    let username = base;
    let suffix = 0;

    while (await this.userRepository.findOne({ where: { username } })) {
      suffix++;
      username = `${base}${suffix}`;
    }

    const user = this.userRepository.create({ username });
    await this.userRepository.save(user);

    const account = this.oauthAccountRepo.create({
      user_id: user.user_id,
      provider,
      provider_user_id: providerUserId,
      access_token: accessToken ?? null,
      refresh_token: refreshToken ?? null,
      expires_at: expiresAt ?? null,
    });
    await this.oauthAccountRepo.save(account);
    return user;
  }

  async rotateRefreshToken(userId: string, rawToken: string) {
    // Verify JWT first
    let payload: JwtRefreshPayload;

    try {
      payload = this.jwtService.verify<JwtRefreshPayload>(rawToken, {
        secret: this.refreshTokenSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.user_id !== userId) throw new UnauthorizedException('Invalid refresh token');

    const record = await this.refreshTokenRepo.findOne({
      where: { id: payload.jti, user_id: userId },
    });

    if (!record || record.revoked_at) throw new UnauthorizedException('Refresh token revoked');

    if (record.expires_at.getTime() < Date.now())
      throw new UnauthorizedException('Refresh token expired');

    const valid = await argon2.verify(record.token_hash, rawToken);

    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    // Rotate: revoke current and issue new
    record.revoked_at = new Date();
    await this.refreshTokenRepo.save(record);

    const accessToken = this.issueAccessToken(userId);
    const refreshToken = await this.issueRefreshToken(userId);
    return { token: accessToken, accessToken, refreshToken };
  }

  async revokeRefreshToken(userId: string, rawToken: string) {
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(rawToken, {
        secret: this.refreshTokenSecret(),
      });

      if (payload.user_id !== userId) throw new UnauthorizedException('Invalid refresh token');

      const record = await this.refreshTokenRepo.findOne({
        where: { id: payload.jti, user_id: userId },
      });

      if (!record) return { revoked: 0 };

      if (!record.revoked_at) {
        record.revoked_at = new Date();
        await this.refreshTokenRepo.save(record);
        return { revoked: 1 };
      }

      return { revoked: 0 };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeAllRefreshTokens(userId: string) {
    const active = await this.refreshTokenRepo.find({ where: { user_id: userId } });
    let count = 0;

    for (const r of active) {
      if (!r.revoked_at) {
        r.revoked_at = new Date();
        await this.refreshTokenRepo.save(r);
        count++;
      }
    }

    return { revoked: count };
  }

  generateJwt(payload: JwtPayload) {
    // Back-compat helper if still needed somewhere
    return { token: this.jwtService.sign(payload) };
  }
}
