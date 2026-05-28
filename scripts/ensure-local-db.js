/**
 * Creates local database from DATABASE_URL name if missing (connects via postgres DB).
 * Usage: node scripts/ensure-local-db.js
 */
const { PrismaClient } = require('../lib/generated/prisma')

const databaseUrl = process.env.DATABASE_URL || ''
const match = databaseUrl.match(/\/([^/?]+)(\?|$)/)
const targetDb = match ? match[1] : 'ocp_db'

const adminUrl =
  process.env.DATABASE_ADMIN_URL ||
  databaseUrl.replace(`/${targetDb}`, '/postgres').replace(`/${targetDb}?`, '/postgres?')

async function main() {
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in .env')
    process.exit(1)
  }

  console.log(`Target database: ${targetDb}`)
  console.log(`Admin connection: ${adminUrl.replace(/:[^:@]+@/, ':****@')}`)

  const admin = new PrismaClient({ datasources: { db: { url: adminUrl } } })

  try {
    const existing = await admin.$queryRaw`
      SELECT datname FROM pg_database WHERE datname = ${targetDb}
    `
    if (existing.length > 0) {
      console.log(`Database "${targetDb}" already exists.`)
    } else {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${targetDb}"`)
      console.log(`Created database "${targetDb}".`)
    }
  } finally {
    await admin.$disconnect()
  }

  const app = new PrismaClient()
  try {
    await app.$queryRaw`SELECT 1`
    console.log(`App connection to "${targetDb}" OK.`)
  } finally {
    await app.$disconnect()
  }
}

main().catch((e) => {
  console.error(e.message || e)
  console.error('\nEnsure PostgreSQL is running on localhost:5432 and .env credentials are correct.')
  process.exit(1)
})
