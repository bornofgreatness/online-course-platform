import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../../lib/auth/admin'
import { getPrisma } from '../../../../../../lib/prisma'


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const prisma = getPrisma()

    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name },
    })

    return NextResponse.json({ category })
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const status = e?.code === 'P2002' ? 409 : e?.statusCode || 500
    const message = e?.code === 'P2002' ? 'Category name already exists' : e?.message || 'Failed to update category'
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const prisma = getPrisma()

    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ error: e?.message || 'Failed to delete category' }, { status: e?.statusCode || 500 })
  }
}

