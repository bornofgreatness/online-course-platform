const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const email = process.argv[2] || 'admin@courseplatform.test'
    const password = process.argv[3] || 'password123'

    const user = await prisma.user.findUnique({ where: { email } })
    console.log('user found:', !!user)
    if (!user) return

    console.log('role:', user.role)
    console.log('emailVerifiedAt:', user.emailVerifiedAt)
    const pwmatch = await bcrypt.compare(password, user.password)
    console.log('pwmatch:', pwmatch)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

