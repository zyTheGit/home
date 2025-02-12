import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { Tenant } from "../tenants/entities/tenant.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly configService: ConfigService
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedException("用户不存在");
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new UnauthorizedException("密码错误");
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;
    const user = await this.validateUser(phone, password);

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };
    
    // 生成刷新令牌（7天有效期）
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // 保存刷新令牌到数据库
    await this.usersService.update(user.id, {
      refreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    let tenant = null;
    if (user.role === "user") {
      tenant = await this.tenantRepository.findOne({
        where: {
          phone: user.phone,
        },
      });
    }

    return {
      token: this.jwtService.sign(payload),
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        tenant: tenant,
      },
    };
  }

  async getCurrentUser(userId: number) {
    return this.usersService.findByPhone(userId.toString());
  }

  async refreshToken(refreshToken: string) {
    // 添加空值检查
    if (!refreshToken) {
      throw new UnauthorizedException('刷新令牌不能为空');
    }
    
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET')
      });
      
      // 添加额外验证：检查刷新令牌是否即将过期（剩余时间小于5分钟不刷新）
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp - now < 300) {
        throw new UnauthorizedException('刷新令牌即将过期');
      }

      const user = await this.usersService.findByPhone(payload.phone);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      // 生成新的访问令牌
      const newPayload = {
        sub: user.id,
        phone: user.phone,
        role: user.role,
      };
      
      // 生成新的刷新令牌
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      // 更新用户刷新令牌
      await this.usersService.update(user.id, { 
        refreshToken: newRefreshToken,
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return {
        token: this.jwtService.sign(newPayload),
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          tenant: user.role === 'user' ? await this.tenantRepository.findOne({ where: { phone: user.phone } }) : null,
        },
      };
    } catch (error) {
      // 记录异常刷新尝试
      console.error(`Refresh token failed: ${error.message}`);
      throw new UnauthorizedException('刷新令牌已失效');
    }
  }
}
