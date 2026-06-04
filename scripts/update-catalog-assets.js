const { PrismaClient } = require('@prisma/client')
const {
  PLATFORM_CATALOG,
  DEFAULT_PDF_URL,
  DEFAULT_THUMBNAIL,
  courseThumbnailUrl,
} = require('../lib/platformCatalog.cjs')

const OLD_DUMMY_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating category images and old dummy course PDFs...')

  let categoriesUpdated = 0
  let coursesUpdated = 0
  let lessonsUpdated = 0
  let thumbnailsUpdated = 0

  for (const cat of PLATFORM_CATALOG) {
    const result = await prisma.category.updateMany({
      where: { name: cat.name },
      data: {
        icon: cat.icon,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
      },
    })
    categoriesUpdated += result.count
  }

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { pdfUrl: OLD_DUMMY_PDF_URL },
        { pdfUrl: '' },
        { thumbnailUrl: null },
        { thumbnailUrl: DEFAULT_THUMBNAIL },
      ],
    },
    select: {
      id: true,
      title: true,
      pdfUrl: true,
      thumbnailUrl: true,
      category: { select: { name: true } },
    },
  })

  for (const course of courses) {
    const data = {}
    if (!course.pdfUrl || course.pdfUrl === OLD_DUMMY_PDF_URL) {
      data.pdfUrl = DEFAULT_PDF_URL
    }
    if (!course.thumbnailUrl || course.thumbnailUrl === DEFAULT_THUMBNAIL) {
      data.thumbnailUrl = courseThumbnailUrl(course.category.name, course.title)
    }

    if (!Object.keys(data).length) continue

    await prisma.course.update({
      where: { id: course.id },
      data,
    })
    if (data.pdfUrl) coursesUpdated++
    if (data.thumbnailUrl) thumbnailsUpdated++

    if (data.pdfUrl) {
      const result = await prisma.lesson.updateMany({
        where: {
          courseId: course.id,
          OR: [{ materialUrl: OLD_DUMMY_PDF_URL }, { materialUrl: null }],
        },
        data: { materialUrl: DEFAULT_PDF_URL },
      })
      lessonsUpdated += result.count
    }
  }

  console.log(
    `Updated ${categoriesUpdated} categories, ${coursesUpdated} course PDFs, ${thumbnailsUpdated} course thumbnails, ${lessonsUpdated} lessons.`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
