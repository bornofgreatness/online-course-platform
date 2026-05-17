const bcrypt = require('bcryptjs')
const { PrismaClient } = require('../lib/generated/prisma')
const {
  PLATFORM_CATALOG,
  DEFAULT_WORKLOAD_HOURS,
  DEFAULT_PDF_URL,
  DEFAULT_THUMBNAIL,
  countCatalogCourses,
} = require('../lib/platformCatalog.cjs')

const prisma = new PrismaClient()

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
        const existing = await prisma.course.findFirst({
          where: { title: course.title, categoryId: category.id },
        })
        if (!existing) {
          await prisma.course.create({
            data: {
              title: course.title,
              description:
                course.description ||
                `Formação profissional em ${sub.name}. Certificado de ${DEFAULT_WORKLOAD_HOURS} horas.`,
              categoryId: category.id,
              subcategoryId: subcategory.id,
              pdfUrl: DEFAULT_PDF_URL,
              thumbnailUrl: DEFAULT_THUMBNAIL,
              workloadHours: DEFAULT_WORKLOAD_HOURS,
              syllabus: `Módulo 1: Fundamentos\nMódulo 2: Prática\nMódulo 3: Avaliação\nMódulo 4: Certificação (${DEFAULT_WORKLOAD_HOURS}h)`,
              seoTitle: `${course.title} | Plataforma de Cursos`,
              seoDescription: `Curso online com certificado de ${DEFAULT_WORKLOAD_HOURS} horas em ${sub.name}.`,
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
        }
      }
    }
  }
  return courseCount
}

function mkQuiz() {
  return JSON.stringify({
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `q${i + 1}`,
      prompt: `Verificação ${i + 1}: O que melhor descreve a conclusão de cursos nesta plataforma?`,
      options: [
        'Estudar os materiais, passar no quiz quando houver, e solicitar o certificado',
        'Apenas visitar a página inicial',
        'Pular a inscrição',
        'Ignorar o status da assinatura',
      ],
      correctIndex: 0,
    })),
  })
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
