import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let errors = null;

    // 处理 HTTP 异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // 处理验证错误
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        if (Array.isArray(exceptionResponse['message'])) {
          // 处理验证错误数组
          errors = exceptionResponse['message'].map((error: string) => ({
            message: error,
          }));
          message = '请求参数验证失败';
        } else {
          message = exceptionResponse['message'] as string;
        }
      } else {
        message = exception.message;
      }
    }

    // 构建错误响应
    const errorResponse = {
      statusCode: status,
      message: message,
      errors: errors,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    };

    // 发送响应
    response.status(status).json(errorResponse);
  }
} 