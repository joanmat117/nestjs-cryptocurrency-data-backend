import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(cookieParser());

  app.useGlobalFilters(new PrismaExceptionFilter());

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Cryptocurrency Data Backend API')
    .setDescription('API for accessing cryptocurrency data from CoinMarketCap')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Use Scalar for API documentation
  app.use('/docs', apiReference({ openapi: JSON.stringify(document) } as any));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
