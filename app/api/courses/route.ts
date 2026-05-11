import { NextResponse } from 'next/server'
import { getPrisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  // During `next build`, Next may attempt to prerender/export API routes.
  // If DB isn't reachable (e.g. local build without Postgres), return an empty list instead of crashing.
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const prisma = getPrisma()
    const courses = await prisma.course.findMany({
      include: {
        category: true,
        enrollments: true,
      },
    })
    return NextResponse.json(courses)
  } catch (error: any) {
    console.error('Error fetching courses:', error)
    return NextResponse.json([], { status: 200 })
  }
}
