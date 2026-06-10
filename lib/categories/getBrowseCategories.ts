import { getPrisma } from '../prisma'

export type BrowseCategory = {
  id: string
  name: string
  icon: string | null
  imageUrl: string | null
  _count: { courses: number }
  subcategories: { id: string; name: string; _count: { courses: number } }[]
}

export async function getBrowseCategories(): Promise<BrowseCategory[]> {
  if (!process.env.DATABASE_URL) return []

  try {
    const prisma = getPrisma()
    return prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { courses: true } },
        subcategories: {
          orderBy: { name: 'asc' },
          include: { _count: { select: { courses: true } } },
        },
      },
    })
  } catch {
    return []
  }
}
