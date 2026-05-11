import { NextResponse } from 'next/server'
import { getPrisma } from '../../../lib/prisma'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 })
  }

  const prisma = getPrisma()
  const courses = await prisma.course.findMany({
    include: {
      category: true
    }
  })
  return NextResponse.json(courses)
}