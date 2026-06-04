import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Always keep a single PrismaClient instance per Node.js process.
// Prevents "too many clients already" errors under Next.js concurrency/hot reload.
export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }

  return globalForPrisma.prisma
}

// Disable disconnect-by-default; disconnecting during request handling can force
// Prisma to create additional clients and exhaust the DB.
export async function closePrisma() {
  // no-op in server runtime
}


