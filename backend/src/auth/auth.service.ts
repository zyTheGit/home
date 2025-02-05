import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new UnauthorizedException('密码错误');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;
    const user = await this.validateUser(phone, password);

    const payload = { 
      sub: user.id, 
      phone: user.phone,
      role: user.role 
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId: number) {
    return this.usersService.findByPhone(userId.toString());
  }
} 