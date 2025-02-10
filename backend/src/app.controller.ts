import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get('ip')
  getClientIp(@Req() request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    const clientIp = xForwardedFor
      ? (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0])  // 取第一个 IP
      : request.ip;
    return `Client IP: ${clientIp}`;
  }
}
