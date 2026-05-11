const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  if (!email || !password) {
    console.error('Usage: node scripts/check-nextauth-authorize.js <email> <password>')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('user?', !!user)
    if (!user) return

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('pwmatch:', isPasswordValid)

    const role = (user.role ?? '').toString().trim().toUpperCase()
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const emailVerifiedAt = user.emailVerifiedAt
    console.log('role:', user.role, 'normalized:', role)
    console.log('isAdmin:', isAdmin)
    console.log('emailVerifiedAt:', emailVerifiedAt)

    if (!isAdmin && !emailVerifiedAt) {
      console.log('authorize() would return null (unverified non-admin)')
      return
    }

    console.log('authorize() would return user object')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

