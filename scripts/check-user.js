const { PrismaClient } = require('../lib/generated/prisma');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.argv[2];
    if (!email) {
      const users = await prisma.user.findMany({
        take: 20,
        select: { id: true, email: true, role: true, emailVerifiedAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      console.log(JSON.stringify(users, null, 2));
      return;
    }

    const u = await prisma.user.findUnique({ where: { email } });
    console.log(JSON.stringify(u, null, 2));

  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

