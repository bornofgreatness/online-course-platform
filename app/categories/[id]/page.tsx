import { getPrisma } from '../../../lib/prisma'
import Link from 'next/link'
import Header from '../../../components/Header'

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
        <main className="min-h-screen p-8">
          <p>Category not found.</p>
          <Link href="/categories" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to categories
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {category.courses.length} course{category.courses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/categories" className="text-blue-600 hover:underline">
              All categories
            </Link>
            <Link href="/courses" className="text-blue-600 hover:underline">
              All courses
            </Link>
          </div>
        </div>

        {category.courses.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            No courses in this category yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="h-48 flex-shrink-0 overflow-hidden bg-gray-200">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-4xl text-blue-600">
                      📚
                    </div>
                  )}
                </div>
                <div className="flex flex-grow flex-col p-6">
                  <h2 className="mb-2 line-clamp-2 text-lg font-semibold">{course.title}</h2>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">{course.description}</p>
                  <div className="mb-2 text-xs text-gray-500">{course.workloadHours} hours</div>
                  <div className="mb-4 text-sm font-medium text-blue-600">
                    {course.enrollments.length} student{course.enrollments.length !== 1 ? 's' : ''}
                  </div>
                  <Link
                    href={`/courses/${course.id}`}
                    className="mt-auto text-sm font-medium text-blue-600 hover:underline"
                  >
                    View course →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
