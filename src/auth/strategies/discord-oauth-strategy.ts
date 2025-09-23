import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    const backendUrl = config.get('BACKEND_URL') ?? 'http://localhost:3000';
    const callbackURL = config.get('DISCORD_CALLBACK_URL') ?? `${backendUrl}/auth/discord/callback`;
    
    console.log('Discord OAuth Strategy initialized with:', {
      clientID: config.get('DISCORD_CLIENT_ID'),
      callbackURL,
      hasClientSecret: !!config.get('DISCORD_CLIENT_SECRET'),
    });

    super({
      clientID: config.get('DISCORD_CLIENT_ID')!,
      clientSecret: config.get('DISCORD_CLIENT_SECRET')!,
      callbackURL,
      scope: ['identify', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('Discord OAuth validate called with profile:', {
      id: profile.id,
      username: profile.username,
      email: (profile as any).email,
    });

    const { id: providerUserId, username } = profile;
    const user = await this.authService.findOrCreateUserFromOAuth({
      provider: 'discord',
      providerUserId,
      suggestedUsername: username,
      email: (profile as any).email ?? null,
      accessToken,
      refreshToken,
      expiresAt: null,
    });

    console.log('Discord OAuth user created/found:', { userId: user.user_id, username: user.username });
    return user;
  }
}
