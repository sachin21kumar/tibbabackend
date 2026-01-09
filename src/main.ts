import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Cast app as NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strip unknown properties
      forbidNonWhitelisted: true,   // Throw error for extra properties
      transform: true,              // Auto-transform types
    }),
  );

  // Enable CORS
  app.enableCors();

  // Serve uploads folder statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // e.g., http://localhost:3000/uploads/images/...
    setHeaders(res) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  },
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
