import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  
  app.useGlobalFilters(new AllExceptionFilter);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
