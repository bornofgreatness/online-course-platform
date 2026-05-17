import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPrisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const prisma = getPrisma()
    const subcategories = await prisma.subcategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { courses: true } },
      },
    })

    return NextResponse.json({ subcategories })
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, categoryId } = body as { name?: string; categoryId?: string }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Subcategory name is required' }, { status: 400 })
    }
    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
    }

    const prisma = getPrisma()

    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const subcategory = await prisma.subcategory.create({
      data: { name: name.trim(), categoryId },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { courses: true } },
      },
    })

    return NextResponse.json({ subcategory })
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; statusCode?: number }
    const status = err?.code === 'P2002' ? 409 : err?.statusCode || 500
    const message =
      err?.code === 'P2002' ? 'Subcategory already exists in this category' : err?.message || 'Failed to create subcategory'
    return NextResponse.json({ error: message }, { status })
  }
}
