const { PrismaClient } = require('./lib/generated/prisma')
const bcrypt = require('bcryptjs')

async function seedUsers() {
  // Create a new client instance to avoid cache issues
  const prisma = new PrismaClient()

  try {
    const password = await bcrypt.hash('password123', 10)

    // Create admin user
    await prisma.user.upsert({
      where: { email: 'admin@courseplatform.test' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@courseplatform.test',
        password,
        role: 'ADMIN',
        emailVerifiedAt: new Date()
      }
    })

    // Create student user
    await prisma.user.upsert({
      where: { email: 'student@courseplatform.test' },
      update: {},
      create: {
        name: 'Student User',
        email: 'student@courseplatform.test',
        password,
        role: 'STUDENT',
        emailVerifiedAt: new Date()
      }
    })

    console.log('Users seeded successfully!')
  } catch (error) {
    console.error('Error seeding users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()