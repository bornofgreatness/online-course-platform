import { NextResponse } from 'next/server'
import { getPrisma } from '../../../../../lib/prisma'

export const dynamic = 'force-dynamic'

/** Public certificate verification (no auth). */
export async function GET(_request: Request, { params }: { params: { certificateNumber: string } }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ valid: false }, { status: 200 })
  }

  const certificateNumber = decodeURIComponent(params.certificateNumber || '').trim()
  if (!certificateNumber) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const prisma = getPrisma()
  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber },
    include: {
      course: { select: { title: true, workloadHours: true } },
      user: { select: { name: true } },
    },
  })

  if (!cert) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    certificateNumber: cert.certificateNumber,
    courseName: cert.courseTitle || cert.course.title,
    workloadHours: cert.workloadHours ?? cert.course.workloadHours,
    issuedAt: cert.issuedAt.toISOString(),
    holderName: cert.holderName || cert.user.name,
  })
}
