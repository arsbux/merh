import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
// Triggering reload to sync with new schema

// Bypass TLS certificate validation for local development with self-signed certs (Supabase/Postgres)
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.warn("[Prisma] DATABASE_URL is not set");
  } else {
    // Force sslmode=no-verify for development to avoid certificate errors
    if (connectionString.includes('supabase') || connectionString.includes('postgres')) {
      if (connectionString.includes('sslmode=require')) {
        connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
      } else if (!connectionString.includes('sslmode=')) {
        connectionString += connectionString.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
      }
    }
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 10 seconds timeout for faster error reporting
  })

  pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err)
  })

  // Prisma 7 with driver adapter
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
