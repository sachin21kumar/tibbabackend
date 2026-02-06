import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /* ===============================
     🔥 FIX 1: DISABLE ETAG (CRITICAL)
     =============================== */
  app.disable('etag');

  /* ===============================
     🔥 FIX 2: PROPER CORS CONFIG
     =============================== */
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.1.4:3000',
      'http://50.6.249.155:3000/',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  /* ===============================
     GLOBAL VALIDATION
     =============================== */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /* ===============================
     STATIC FILES
     =============================== */
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
