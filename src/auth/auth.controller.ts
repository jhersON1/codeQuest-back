import { Controller, Post, Body, Get, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';

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
  discordCallback(@GetUser() user: User) {
    return this.authService.generateJwt({ user_id: user.user_id });
  }

  @Auth('admin')
  @Get('private')
  testProtectedRoute() {
    return 'private route';
  }
}
