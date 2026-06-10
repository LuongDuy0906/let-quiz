import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/http-exception.filter';
import { validateEnv } from './config/validation';
import { LoggerService } from './common/logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  try {
    await validateEnv(process.env);
  } catch (error: any) {
    console.error('Lỗi khi xác thực biến môi truòng: ', error.message);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);

  const config = new DocumentBuilder()
        .setTitle("API Document for LetQuiz - a Quiz Game Website")
        .setVersion("1.0")
        .addBearerAuth()
        .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/document', app, document);

  app.useGlobalPipes(new ValidationPipe({
      whitelist: true,      
      forbidNonWhitelisted: true,
      transform: true,      
      disableErrorMessages: false
    }));
  
  app.useGlobalFilters(new AllExceptionFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Chương trình đã được khởi với cổng ${port}`);
}
bootstrap();
