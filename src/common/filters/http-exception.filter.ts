import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { LoggerService } from "../logger/logger.service";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status: number = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage = "Lỗi hệ thống";
    let errorType = "Internal Server Error";

    if (isHttpException) {
      const exceptionResponse: any = exception.getResponse();
      errorMessage = typeof exceptionResponse.message === 'string' 
        ? exceptionResponse.message 
        : exceptionResponse.message[0]; 
      errorType = exceptionResponse.error || exception.name;
    } else {
      console.log("Critical Error", exception);
    }

    this.logger.error(
      `${request.method} ${request.url} - ${errorMessage}`,
      exception.stack,
      'HTTP_EXCEPTION',
      { statusCode: status, errorType, method: request.method, url: request.url },
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorType,
      message: errorMessage
    });
  }
}