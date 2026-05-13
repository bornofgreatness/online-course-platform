import Link from 'next/link'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'
import CategoryListCard from '../../components/CategoryListCard'
import { getPrisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  let categories: {
    id: string
    name: string
    icon: string | null
    imageUrl: string | null
    _count: { courses: number }
  }[] = []

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
      <PageShell>
        <div className="mb-8">
          <h1 className={siteTitleClass}>Categories</h1>
          <p className={`${siteMutedClass} mt-2 max-w-2xl`}>
            Browse courses grouped by topic. Select a category to see all courses in that area.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className={`${siteCardClass} p-10 text-center ${siteMutedClass}`}>No categories are available yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((cat) => (
              <CategoryListCard key={cat.id} category={cat} />
            ))}
          </div>
        )}

        <p className="mt-10">
          <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:underline">
            ← All courses
          </Link>
        </p>
      </PageShell>
    </>
  )
}
