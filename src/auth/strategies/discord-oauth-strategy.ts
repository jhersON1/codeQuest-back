import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {
    super({
      clientID: config.get('DISCORD_CLIENT_ID')!,
      clientSecret: config.get('DISCORD_CLIENT_SECRET')!,
      callbackURL: config.get('DISCORD_CALLBACK_URL'),
      scope: ['identify', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id: providerUserId, username } = profile;
    const user = await this.authService.findOrCreateUserFromOAuth({
      provider: 'discord',
      providerUserId,
      suggestedUsername: username,
      accessToken,
      refreshToken,
      expiresAt: null,
    });
    return user;
  }
}
