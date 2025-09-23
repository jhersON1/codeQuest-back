import { Controller, Post, Body, Get, HttpCode, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetToken } from './decorators/get-token.decorator';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordAuthentication() {
    return;
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(
    @GetUser() user: User,
    @Res() res: Response
  ) {
    console.log('Discord callback called with user:', { userId: user.user_id, username: user.username });
    
    const accessToken = this.authService.issueAccessToken(user.user_id);
    const refreshToken = await this.authService.issueRefreshToken(user.user_id);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    const redirectUrl = `${frontendUrl}/discord/callback?accessToken=${encodeURIComponent(
      accessToken,
    )}&refreshToken=${encodeURIComponent(refreshToken)}`;

    console.log('Redirecting to:', redirectUrl);

    res.redirect(redirectUrl);
  }

  @HttpCode(200)
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  refresh(@GetUser() user: User, @GetToken() token: string | null) {
    if (!token) return { message: 'Missing refresh token' };

    return this.authService.rotateRefreshToken(user.user_id, token);
  }

  @HttpCode(200)
  @Post('logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  logout(@GetUser() user: User, @GetToken() token: string | null) {
    if (!token) return { revoked: 0 };

    return this.authService.revokeRefreshToken(user.user_id, token);
  }

  @HttpCode(200)
  @Post('logout-all')
  @Auth('admin', 'author', 'subscriber')
  logoutAll(@GetUser() user: User) {
    return this.authService.revokeAllRefreshTokens(user.user_id);
  }

  @Get('me')
  @Auth('admin', 'author', 'subscriber')
  getCurrentUser(@GetUser() user: User) {
    // Do not expose sensitive fields
    const { password, ...safeUser } = user as unknown as { password?: string } & User
    return safeUser as User
  }

  @Auth('admin')
  @Get('private')
  testProtectedRoute() {
    return 'private route';
  }
}
