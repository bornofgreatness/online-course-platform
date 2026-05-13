const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../lib/generated/prisma');

async function main() {
  const email = process.argv[2] || 'admin@courseplatform.test';
  const password = process.argv[3] || 'password123';
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('found:', !!user);
    if (!user) return;

    const pwmatch = await bcrypt.compare(password, user.password);
    console.log('pwmatch:', pwmatch);

    const role = (user.role ?? '').toString().trim().toUpperCase();
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    const emailVerifiedAt = user.emailVerifiedAt;

    console.log({ role, isAdmin, emailVerifiedAt });

    let authorizeResult = null;
    if (pwmatch && (isAdmin || emailVerifiedAt)) {
      authorizeResult = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
    console.log('authorizeResult:', authorizeResult);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

