import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Photo Uploader API')
    .setDescription(
      'REST API for photo uploading with authentication and authorization',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addApiKey(
      {
        type: 'apiKey',
        name: 'device-id',
        in: 'header',
        description: 'Unique device identifier (UUID recommended)',
      },
      'device-id',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'accept-language',
        in: 'header',
        description: 'Language preference (tr or en)',
      },
      'accept-language',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📜 Swagger documentation: http://localhost:${port}/api`);
}
void bootstrap();
