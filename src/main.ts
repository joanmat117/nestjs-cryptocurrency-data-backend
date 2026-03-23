import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(cookieParser());

  app.useGlobalFilters(new PrismaExceptionFilter());

  // OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Cryptocurrency Data Backend API')
    .setDescription('API for accessing cryptocurrency data from CoinMarketCap')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI at /docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
