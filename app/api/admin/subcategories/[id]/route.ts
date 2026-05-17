import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPrisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { name, categoryId } = body as { name?: string; categoryId?: string }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Subcategory name is required' }, { status: 400 })
    }

    const prisma = getPrisma()

    const data: { name: string; categoryId?: string } = { name: name.trim() }
    if (categoryId && typeof categoryId === 'string') {
      const category = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
      data.categoryId = categoryId
    }

    const subcategory = await prisma.subcategory.update({
      where: { id: params.id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { courses: true } },
      },
    })

    return NextResponse.json({ subcategory })
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; statusCode?: number }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }
    const status = err?.code === 'P2002' ? 409 : err?.statusCode || 500
    const message =
      err?.code === 'P2002' ? 'Subcategory name already exists in this category' : err?.message || 'Failed to update subcategory'
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const prisma = getPrisma()
    await prisma.subcategory.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string; statusCode?: number }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }
    return NextResponse.json({ error: err?.message || 'Failed to delete subcategory' }, { status: err?.statusCode || 500 })
  }
}
