import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // 处理不同类型的响应
        const response = {
          data: null,
          message: '操作成功',
          statusCode: context.switchToHttp().getResponse().statusCode
        };

        if (data === null || data === undefined) {
          return response;
        }

        if (typeof data === 'object') {
          if ('data' in data) {
            response.data = data.data;
          } else {
            response.data = data;
          }

          if ('message' in data) {
            response.message = data.message;
          }
        } else {
          response.data = data;
        }

        return response;
      })
    );
  }
}