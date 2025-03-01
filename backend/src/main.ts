import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config as initializeDotenv } from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { readFileSync } from 'fs';

initializeDotenv();

const PORT = process.env.PORT ?? 3000;

export const CORS_CONFIG: CorsOptions = {
  origin: ['https://meet.google.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
  ],
  credentials: true,
};

const httpsOptions = {
  key: readFileSync(
    `/etc/letsencrypt/live/${process.env.SSL_CERT_DOMAIN}/privkey.pem`,
  ),
  cert: readFileSync(
    `/etc/letsencrypt/live/${process.env.SSL_CERT_DOMAIN}/cert.pem`,
  ),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors(CORS_CONFIG);

  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}

bootstrap();
