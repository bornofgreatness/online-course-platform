import Header from '../../components/Header'
import CategoriesView from '../../components/views/CategoriesView'
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
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { courses: true } } },
      })
    } catch {
      categories = []
    }
  }

  return (
    <>
      <Header />
      <CategoriesView categories={categories} />
    </>
  )
}
