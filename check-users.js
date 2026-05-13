const { PrismaClient } = require('./lib/generated/prisma')

async function checkUsers() {
  const prisma = new PrismaClient()

  try {
    const users = await prisma.user.findMany()
    console.log('Users in database:')
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Verified: ${!!user.emailVerifiedAt}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()