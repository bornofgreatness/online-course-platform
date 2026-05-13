import { PrismaClient } from './generated/prisma'

let prisma: PrismaClient | null = null

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error']
    })
  }

  return prisma
}

export async function closePrisma() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}
