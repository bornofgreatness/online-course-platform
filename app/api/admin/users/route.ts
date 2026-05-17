import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const prisma = getPrisma()
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        whatsapp: true,
        address: true,
        city: true,
        state: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            subscriptions: true,
            payments: true,
            certificates: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Forbidden' }, { status: e?.statusCode || 403 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, role } = body as { id?: string; role?: string }

    if (!id || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 })
    }

    const prisma = getPrisma()
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({ user })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update user' }, { status: e?.statusCode || 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const prisma = getPrisma()
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete user' }, { status: e?.statusCode || 500 })
  }
}
