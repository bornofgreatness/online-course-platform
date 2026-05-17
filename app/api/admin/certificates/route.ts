import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const prisma = getPrisma()
    const certificates = await prisma.certificate.findMany({
      orderBy: { issuedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ certificates })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Forbidden' }, { status: e?.statusCode || 403 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 })
    }

    const prisma = getPrisma()
    await prisma.certificate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete certificate' }, { status: e?.statusCode || 500 })
  }
}
