import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 3000;

export const CORS_CONFIG = {
  origin: ['https://meet.google.com'],
  methods: ['*'],
  allowedHeaders: ['*'],
  credentials: true,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(CORS_CONFIG);

  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}

bootstrap();
