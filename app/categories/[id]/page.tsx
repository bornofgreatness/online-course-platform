import { getPrisma } from '../../../lib/prisma'
import Header from '../../../components/Header'
import CategoryDetailView from '../../../components/views/CategoryDetailView'

interface Props {
  params: { id: string }
  searchParams: { sub?: string }
}

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params, searchParams }: Props) {
  let category: Parameters<typeof CategoryDetailView>[0]['category'] | null = null

  if (process.env.DATABASE_URL) {
    try {
      const prisma = getPrisma()
      category = await prisma.category.findUnique({
        where: { id: params.id },
        include: {
          subcategories: {
            orderBy: { name: 'asc' },
            include: {
              courses: {
                orderBy: { title: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
          courses: {
            orderBy: { title: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailUrl: true,
            },
          },
        },
      })
    } catch {
      category = null
    }
  }

  return (
    <>
      <Header />
      <CategoryDetailView category={category} initialSubcategoryId={searchParams.sub ?? ''} />
    </>
  )
}
