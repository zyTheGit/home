import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { API_PREFIX } from './config/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 全局路由前缀
  app.setGlobalPrefix(API_PREFIX);
  
  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('租房管理系统 API')
    .setDescription('租房管理系统的 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${API_PREFIX}-docs`, app, document);

  app.enableCors();
  
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
bootstrap(); 