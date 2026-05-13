import Link from 'next/link'
import Header from '../../components/Header'
import { getPrisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  let categories: { id: string; name: string; _count: { courses: number } }[] = []

  if (process.env.DATABASE_URL) {
    try {
      const prisma = getPrisma()
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { courses: true } } },
      })
    } catch {
      categories = []
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-2 text-gray-600">
            Browse courses grouped by topic. Select a category to see all courses in that area.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            No categories are available yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="group flex flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                  {cat.name}
                </h2>
                <p className="mt-3 text-sm text-gray-500">
                  {cat._count.courses} course{cat._count.courses !== 1 ? 's' : ''}
                </p>
                <span className="mt-auto pt-4 text-sm font-medium text-blue-600 group-hover:underline">
                  View category →
                </span>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-10">
          <Link href="/courses" className="text-blue-600 hover:underline">
            ← All courses
          </Link>
        </p>
      </div>
    </>
  )
}
