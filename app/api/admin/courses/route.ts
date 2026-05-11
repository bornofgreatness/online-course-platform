import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPrisma } from '@/lib/prisma'



export async function GET() {
  try {
    await requireAdmin()

    const prisma = getPrisma()
    const courses = await prisma.course.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ courses })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Forbidden' }, { status: e?.statusCode || 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const {
      title,
      description,
      categoryId,
      pdfUrl,
      thumbnailUrl,
      syllabus,
      workloadHours,
      seoTitle,
      seoDescription,
    } = await request.json()

    if (!title || typeof title !== 'string') return NextResponse.json({ error: 'title is required' }, { status: 400 })
    if (!description || typeof description !== 'string') return NextResponse.json({ error: 'description is required' }, { status: 400 })
    if (!categoryId || typeof categoryId !== 'string') return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
    if (!pdfUrl || typeof pdfUrl !== 'string') return NextResponse.json({ error: 'pdfUrl is required' }, { status: 400 })

    const prisma = getPrisma()

    const course = await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        pdfUrl,
        thumbnailUrl: thumbnailUrl || null,
        syllabus: syllabus || null,
        workloadHours: typeof workloadHours === 'number' ? workloadHours : Number(workloadHours || 0),
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    })

    return NextResponse.json({ course })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create course' }, { status: e?.statusCode || 500 })
  }
}

