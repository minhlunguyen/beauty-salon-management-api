import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import { AppExceptionFilter } from '@src/common/exceptions/app-exception.filter';
import { TransformInterceptor } from '@src/common/interceptors/transform.interceptor';
import { AppLogger } from '@src/common/services/app-logger.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  app.enableCors({
    origin: '*',
  });
  app.useGlobalFilters(new AppExceptionFilter(logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('Beauty Salon Management API')
    .setDescription('A comprehensive beauty salon management system API')
    .setVersion('1.0')
    .addServer(process.env.SWAGGER_API_URL || 'http://localhost:5000')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
