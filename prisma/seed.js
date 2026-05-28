const bcrypt = require('bcryptjs')
const { PrismaClient } = require('../lib/generated/prisma')
const {
  PLATFORM_CATALOG,
  DEFAULT_PDF_URL,
  DEFAULT_THUMBNAIL,
  courseThumbnailUrl,
  countCatalogCourses,
} = require('../lib/platformCatalog.cjs')

const prisma = new PrismaClient()
const OLD_DUMMY_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

function withWorkloadText(input, hours) {
  if (!input) return input
  return input
    .replace(/100\s*h(?:oras?)?/gi, `${hours} horas`)
    .replace(/Certificado\s+de\s+\d+\s*horas?/gi, `Certificado de ${hours} horas`)
}

async function seedCatalog() {
  let courseCount = 0
  for (const cat of PLATFORM_CATALOG) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        icon: cat.icon,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
      },
      create: {
        name: cat.name,
        icon: cat.icon,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
      },
    })

    for (const sub of cat.subcategories) {
      const subcategory = await prisma.subcategory.upsert({
        where: {
          categoryId_name: { categoryId: category.id, name: sub.name },
        },
        update: {},
        create: { name: sub.name, categoryId: category.id },
      })

      for (const course of sub.courses) {
        const workloadHours = Number(course.workloadHours || 100)
        const baseDescription =
          course.description ||
          `Formação profissional em ${sub.name}. Certificado de ${workloadHours} horas.`
        const normalizedDescription = withWorkloadText(baseDescription, workloadHours)
        const normalizedSyllabus = withWorkloadText(
          `Módulo 1: Fundamentos\nMódulo 2: Prática\nMódulo 3: Avaliação\nMódulo 4: Certificação (${workloadHours}h)`,
          workloadHours
        )

        const existing = await prisma.course.findFirst({
          where: { title: course.title, categoryId: category.id },
        })
        if (!existing) {
          await prisma.course.create({
            data: {
              title: course.title,
              description: normalizedDescription,
              categoryId: category.id,
              subcategoryId: subcategory.id,
              pdfUrl: DEFAULT_PDF_URL,
              thumbnailUrl: courseThumbnailUrl(cat.name, course.title),
              workloadHours,
              syllabus: normalizedSyllabus,
              seoTitle: `${course.title} | Plataforma de Cursos`,
              seoDescription: `Curso online com certificado de ${workloadHours} horas em ${sub.name}.`,
              lessons: {
                create: [
                  {
                    title: 'Aula 1 — Introdução',
                    sortOrder: 1,
                    videoUrl: null,
                    materialUrl: DEFAULT_PDF_URL,
                    durationMinutes: 45,
                  },
                  {
                    title: 'Aula 2 — Conteúdo principal',
                    sortOrder: 2,
                    materialUrl: DEFAULT_PDF_URL,
                    durationMinutes: 60,
                  },
                  {
                    title: 'Aula 3 — Revisão e certificação',
                    sortOrder: 3,
                    materialUrl: DEFAULT_PDF_URL,
                    durationMinutes: 45,
                  },
                ],
              },
            },
          })
          courseCount++
        } else {
          const data = {}
          if (existing.workloadHours !== workloadHours) {
            data.workloadHours = workloadHours
          }
          if (existing.description && /100\s*h(?:oras?)?|Certificado de \d+\s*horas?/i.test(existing.description)) {
            data.description = withWorkloadText(existing.description, workloadHours)
          }
          if (existing.syllabus && /100\s*h(?:oras?)?|Certificação\s*\(\d+\s*h\)/i.test(existing.syllabus)) {
            data.syllabus = withWorkloadText(existing.syllabus, workloadHours)
          }
          if (existing.seoDescription && /certificado de \d+\s*horas?/i.test(existing.seoDescription)) {
            data.seoDescription = `Curso online com certificado de ${workloadHours} horas em ${sub.name}.`
          }
          if (!existing.pdfUrl || existing.pdfUrl === OLD_DUMMY_PDF_URL) {
            data.pdfUrl = DEFAULT_PDF_URL
          }
          if (!existing.thumbnailUrl || existing.thumbnailUrl === DEFAULT_THUMBNAIL) {
            data.thumbnailUrl = courseThumbnailUrl(cat.name, course.title)
          }

          if (Object.keys(data).length) {
            await prisma.course.update({
              where: { id: existing.id },
              data,
            })
          }

          if (!existing.pdfUrl || existing.pdfUrl === OLD_DUMMY_PDF_URL) {
            await prisma.lesson.updateMany({
              where: {
                courseId: existing.id,
                OR: [{ materialUrl: null }, { materialUrl: OLD_DUMMY_PDF_URL }],
              },
              data: { materialUrl: DEFAULT_PDF_URL },
            })
          }
        }
      }
    }
  }
  return courseCount
}

function mkQuiz() {
  const questions = [
    {
      id: 'q1',
      prompt: 'What is the primary format for course materials on this platform?',
      options: ['PDF documents', 'VHS tapes', 'Printed books only', 'Fax transmissions'],
      correctIndex: 0,
    },
    {
      id: 'q2',
      prompt: 'Where should learners track enrolled courses and certificates?',
      options: ['Dashboard', 'Pricing page', '404 page', 'Sitemap'],
      correctIndex: 0,
    },
    {
      id: 'q3',
      prompt: 'A passing quiz score is at least how many correct answers out of 10?',
      options: ['5', '6', '7', '9'],
      correctIndex: 2,
    },
    {
      id: 'q4',
      prompt: 'How many quiz attempts are allowed per course?',
      options: ['1', '2', '3', 'Unlimited'],
      correctIndex: 2,
    },
    {
      id: 'q5',
      prompt: 'Certificates are issued after you:',
      options: [
        'Enroll only',
        'Complete requirements including passing the quiz when assigned',
        'Share on social media',
        'Open the homepage',
      ],
      correctIndex: 1,
    },
    {
      id: 'q6',
      prompt: 'Subscription access is checked when you:',
      options: [
        'Enroll in a course and open protected materials',
        'Change your avatar color',
        'Print the syllabus only',
        'View the public landing page',
      ],
      correctIndex: 0,
    },
    {
      id: 'q7',
      prompt: 'If you forget your password, you should use:',
      options: ['Forgot password flow', 'Guess until it works', 'Email the instructor', 'Clear cookies only'],
      correctIndex: 0,
    },
    {
      id: 'q8',
      prompt: 'Course workload hours describe:',
      options: [
        'Estimated study time',
        'Server CPU hours',
        'Number of PDF bytes',
        'Instructor age',
      ],
      correctIndex: 0,
    },
    {
      id: 'q9',
      prompt: 'Progress while reading is saved when:',
      options: [
        'You are signed in and enrolled',
        'You disable JavaScript',
        'You use incognito without login',
        'You refresh before loading',
      ],
      correctIndex: 0,
    },
    {
      id: 'q10',
      prompt: 'Unique certificate numbers help with:',
      options: ['Public verification', 'Random decoration', 'Hiding completion', 'Deleting courses'],
      correctIndex: 0,
    },
  ]
  return JSON.stringify({ questions })
}

async function main() {
  const created = await seedCatalog()
  console.log(`Catalog: ${countCatalogCourses()} courses defined, ${created} new courses created.`)

  const password = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@courseplatform.test' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Administrador',
      email: 'admin@courseplatform.test',
      password,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
      whatsapp: '5511999990001',
      city: 'São Paulo',
      state: 'SP',
    },
  })

  await prisma.user.upsert({
    where: { email: 'superadmin@courseplatform.test' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      name: 'Super Administrador',
      email: 'superadmin@courseplatform.test',
      password,
      role: 'SUPER_ADMIN',
      emailVerifiedAt: new Date(),
      whatsapp: '5511999990000',
      city: 'São Paulo',
      state: 'SP',
    },
  })

  await prisma.user.upsert({
    where: { email: 'student@courseplatform.test' },
    update: {},
    create: {
      name: 'Aluno Teste',
      email: 'student@courseplatform.test',
      password,
      role: 'STUDENT',
      emailVerifiedAt: new Date(),
      whatsapp: '5511999990002',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
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

  const allCourses = await prisma.course.findMany({ select: { id: true } })
  for (const c of allCourses) {
    await prisma.quiz.upsert({
      where: { courseId: c.id },
      update: { questions: mkQuiz() },
      create: { courseId: c.id, questions: mkQuiz() },
    })
  }

  await prisma.coupon.upsert({
    where: { code: 'PROMO20' },
    update: { active: true },
    create: {
      code: 'PROMO20',
      description: '20% de desconto na primeira assinatura',
      discountPercent: 20,
      maxUses: 500,
      active: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'BEMVINDO10' },
    update: { active: true },
    create: {
      code: 'BEMVINDO10',
      description: 'R$ 10,00 de desconto',
      discountCents: 1000,
      maxUses: 1000,
      active: true,
    },
  })

  console.log('Seed concluído.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
