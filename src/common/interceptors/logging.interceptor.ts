import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(
          `${method} ${url} - ${duration}ms`,
          'HTTP',
          { statusCode: 200, duration, body: body ? '***' : undefined },
        );
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        this.logger.error(
          `${method} ${url} - ${duration}ms - ${error.message}`,
          error.stack,
          'HTTP',
          { statusCode: error.status, duration },
        );
        throw error;
      }),
    );
  }
}