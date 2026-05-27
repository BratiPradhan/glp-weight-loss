import { config } from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../../.env');
  if (existsSync(envPath)) {
    config({ path: envPath });
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
