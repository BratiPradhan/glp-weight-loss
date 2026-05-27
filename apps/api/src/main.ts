import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only load .env in non-production (local dev). On Railway/Vercel,
// env vars are injected directly into process.env.
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../../../../.env');
  console.log('Loading .env from:', envPath);
  if (existsSync(envPath)) {
    config({ path: envPath });
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on ${port}`);
}

void bootstrap();
