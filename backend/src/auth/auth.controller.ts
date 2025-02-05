import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    return this.authService.getCurrentUser((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return { message: '退出成功' };
  }
} 