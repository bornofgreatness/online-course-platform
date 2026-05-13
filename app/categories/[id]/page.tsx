import { getPrisma } from '../../../lib/prisma'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import CourseListCard from '../../../components/CourseListCard'

interface Props {
  params: { id: string }
}

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: Props) {
  let category: {
    id: string
    name: string
    courses: Array<{
      id: string
      title: string
      description: string
      workloadHours: number
      thumbnailUrl: string | null
      enrollments: Array<{ id: string }>
    }>
  } | null = null

  if (process.env.DATABASE_URL) {
    try {
      const prisma = getPrisma()
      category = await prisma.category.findUnique({
        where: { id: params.id },
        include: {
          courses: {
            orderBy: { title: 'asc' },
            include: { enrollments: true },
          },
        },
      })
    } catch {
      category = null
    }
  }

  if (!category) {
    return (
      <>
        <Header />
        <PageShell>
          <p className={siteMutedClass}>Category not found.</p>
          <Link href="/categories" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Back to categories
          </Link>
        </PageShell>
      </>
    )
  }

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">Category</p>
            <h1 className={`${siteTitleClass} mt-1`}>{category.name}</h1>
            <p className={`${siteMutedClass} mt-2`}>
              {category.courses.length} course{category.courses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/categories" className="text-blue-600 hover:underline">
              All categories
            </Link>
            <Link href="/courses" className="text-blue-600 hover:underline">
              All courses
            </Link>
          </div>
        </div>

        {category.courses.length === 0 ? (
          <div className={`${siteCardClass} p-10 text-center ${siteMutedClass}`}>No courses in this category yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {category.courses.map((course) => (
              <CourseListCard
                key={course.id}
                course={{
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  thumbnailUrl: course.thumbnailUrl,
                }}
              />
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}
