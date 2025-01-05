import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config as initializeDotenv } from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Handler } from 'aws-lambda';
import { createServer } from 'aws-serverless-express';
import { APIGatewayEvent, Context } from 'aws-lambda';

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

let cachedServer: ReturnType<typeof createServer> | null;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(CORS_CONFIG);
  await app.init();
  return createServer(app.getHttpAdapter().getInstance());
}

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(event, context);
};
