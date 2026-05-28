import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPrisma } from '@/lib/prisma'




export async function PUT(request: Request, { params }: { params: { id: string } }) {

  try {
    await requireAdmin()

    const {
      title,
      description,
      categoryId,
      subcategoryId,
      pdfUrl,
      videoUrl,
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
    const parsedWorkloadHours = Number(workloadHours)
    if (!Number.isInteger(parsedWorkloadHours) || parsedWorkloadHours <= 0) {
      return NextResponse.json({ error: 'workloadHours must be a positive integer' }, { status: 400 })
    }

    const prisma = getPrisma()

    if (subcategoryId && typeof subcategoryId === 'string') {
      const sub = await prisma.subcategory.findFirst({
        where: { id: subcategoryId, categoryId },
      })
      if (!sub) {
        return NextResponse.json({ error: 'Subcategory does not belong to category' }, { status: 400 })
      }
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        title,
        description,
        categoryId,
        subcategoryId: typeof subcategoryId === 'string' && subcategoryId ? subcategoryId : null,
        pdfUrl,
        videoUrl: videoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        syllabus: syllabus || null,
        workloadHours: parsedWorkloadHours,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    })

    return NextResponse.json({ course })
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ error: e?.message || 'Failed to update course' }, { status: e?.statusCode || 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const prisma = getPrisma()
    await prisma.course.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ error: e?.message || 'Failed to delete course' }, { status: e?.statusCode || 500 })
  }
}

