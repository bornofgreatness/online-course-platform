const { PrismaClient } = require('../lib/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const category = await prisma.category.upsert({
    where: { name: 'PDF Productivity' },
    update: {
      icon: 'document',
      imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    },
    create: {
      name: 'PDF Productivity',
      icon: 'document',
      imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    },
  })

  const existingCourse = await prisma.course.findFirst({
    where: { title: 'Mastering PDF Learning' }
  })

  const category2 = await prisma.category.upsert({
    where: { name: 'Business Skills' },
    update: {
      icon: 'business',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    },
    create: {
      name: 'Business Skills',
      icon: 'business',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    },
  })

  const category3 = await prisma.category.upsert({
    where: { name: 'Technology' },
    update: {
      icon: 'laptop',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    },
    create: {
      name: 'Technology',
      icon: 'laptop',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    },
  })

  if (!existingCourse) {
    await prisma.course.create({
      data: {
        title: 'Mastering PDF Learning',
        description: 'Professional PDF-based course system for modern learners.',
        categoryId: category.id,
        pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
        syllabus: '1. Overview\n2. PDF workflows\n3. Progress tracking\n4. Certification',
        workloadHours: 10,
        seoTitle: 'Mastering PDF Learning - Online Course',
        seoDescription: 'Get started with PDF-based course delivery and certification.'
      }
    })
  }

  // Add more courses
  const existingCourse2 = await prisma.course.findFirst({
    where: { title: 'Business Communication Essentials' }
  })

  if (!existingCourse2) {
    await prisma.course.create({
      data: {
        title: 'Business Communication Essentials',
        description: 'Learn professional communication skills for the modern workplace.',
        categoryId: category2.id,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
        syllabus: '1. Email etiquette\n2. Presentation skills\n3. Meeting management\n4. Professional networking',
        workloadHours: 8,
        seoTitle: 'Business Communication Skills Course',
        seoDescription: 'Master professional communication in business environments.'
      }
    })
  }

  const existingCourse3 = await prisma.course.findFirst({
    where: { title: 'Introduction to Web Development' }
  })

  if (!existingCourse3) {
    await prisma.course.create({
      data: {
        title: 'Introduction to Web Development',
        description: 'Build your first website with HTML, CSS, and JavaScript fundamentals.',
        categoryId: category3.id,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        syllabus: '1. HTML basics\n2. CSS styling\n3. JavaScript fundamentals\n4. Building your first site',
        workloadHours: 12,
        seoTitle: 'Learn Web Development Online',
        seoDescription: 'Start your web development journey with comprehensive fundamentals.'
      }
    })
  }

  const password = await bcrypt.hash('password123', 10)
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

  const student = await prisma.user.findUnique({ where: { email: 'student@courseplatform.test' } })
  if (student) {
    await prisma.subscription.updateMany({
      where: { userId: student.id, active: true },
      data: { active: false },
    })
    const end = new Date()
    end.setMonth(end.getMonth() + 12)
    await prisma.subscription.create({
      data: {
        userId: student.id,
        plan: '1y',
        startDate: new Date(),
        endDate: end,
        active: true,
      },
    })
  }

  const mkQuiz = () =>
    JSON.stringify({
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: `q${i + 1}`,
        prompt: `Knowledge check ${i + 1}: What best describes completing courses on this platform?`,
        options: [
          'Study materials, pass the quiz when assigned, then request a certificate',
          'Only watch the homepage',
          'Skip enrollment',
          'Ignore subscription status',
        ],
        correctIndex: 0,
      })),
    })

  const allCourses = await prisma.course.findMany({ select: { id: true } })
  for (const c of allCourses) {
    await prisma.quiz.upsert({
      where: { courseId: c.id },
      update: { questions: mkQuiz() },
      create: { courseId: c.id, questions: mkQuiz() },
    })
  }

  console.log('Seed data created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
