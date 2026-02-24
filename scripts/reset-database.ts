import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import { reset } from 'drizzle-seed'
import * as schema from '../src/server/infrastructure/persistence/drizzle/schema.ts'

config({ path: ['.env.local', '.env'] })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required')
}

async function main() {
  const sqlite = new Database(databaseUrl)
  const db = drizzle(sqlite, { schema })

  console.log('Resetting database...')
  await reset(db as any, schema)
  sqlite.close()
  console.log('Database reset complete!')
}

main().catch((error) => {
  console.error('Failed to reset database:', error)
  process.exit(1)
})
