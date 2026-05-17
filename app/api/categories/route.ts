import { NextResponse } from 'next/server'
import { getPrisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const prisma = getPrisma()
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { courses: true } },
        subcategories: {
          orderBy: { name: 'asc' },
          include: { _count: { select: { courses: true } } },
        },
      },
    })
    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        imageUrl: c.imageUrl,
        courseCount: c._count.courses,
        subcategories: c.subcategories.map((s) => ({
          id: s.id,
          name: s.name,
          courseCount: s._count.courses,
        })),
      }))
    )
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json([], { status: 200 })
  }
}
