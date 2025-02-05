import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { API_PREFIX } from './config/constants';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { CustomValidationPipe } from './pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 全局路由前缀
  app.setGlobalPrefix(API_PREFIX);
  
  // 全局响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 使用自定义验证管道
  app.useGlobalPipes(new CustomValidationPipe());
  
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

  await app.listen(3000);
}
bootstrap();