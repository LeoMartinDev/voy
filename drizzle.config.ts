import { defineConfig } from 'drizzle-kit'
import { resolve } from 'node:path';

export default defineConfig({
  out: './src/server/infrastructure/persistence/drizzle/migrations',
  schema: './src/server/infrastructure/persistence/drizzle/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? resolve(import.meta.dir, 'dev.db'),
  },
})
