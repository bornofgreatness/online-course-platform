import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/auth/admin'
import { getPrisma } from '../../../../../lib/prisma'


export async function GET() {
  try {
    await requireAdmin()

    const prisma = getPrisma()
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ categories })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Forbidden' }, { status: e?.statusCode || 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const prisma = getPrisma()

    const category = await prisma.category.create({
      data: { name },
    })

    return NextResponse.json({ category })
  } catch (e: any) {
    const status = e?.code === 'P2002' ? 409 : e?.statusCode || 500
    const message = e?.code === 'P2002' ? 'Category already exists' : e?.message || 'Failed to create category'
    return NextResponse.json({ error: message }, { status })
  }
}

