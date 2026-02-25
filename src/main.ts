import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('etag');
  app.setGlobalPrefix('api');
  app.enableCors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-locale',
  ],
});
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
