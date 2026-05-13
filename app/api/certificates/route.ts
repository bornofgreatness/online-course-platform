import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import { getPrisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { courseId } = await request.json()
  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if user is enrolled and has completed the course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId
      }
    },
    include: { course: true }
  })

  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 404 })
  }

  const progress = enrollment.progress ? JSON.parse(enrollment.progress) : { completed: false }
  if (!progress.completed) {
    return NextResponse.json({ error: 'Course not completed yet' }, { status: 400 })
  }

  // Check if certificate already exists
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId
      }
    }
  })

  if (existingCertificate) {
    return NextResponse.json({ certificate: existingCertificate })
  }

  // Generate certificate number
  const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  const pdfPath = `/api/certificates/pdf/${encodeURIComponent(certificateNumber)}`

  // Create certificate
  const certificate = await prisma.certificate.create({
    data: {
      userId: user.id,
      courseId,
      certificateNumber,
      pdfUrl: pdfPath,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Certificate: ${certificateNumber}`)}`
    }
  })

  return NextResponse.json({ certificate })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: {
          title: true,
          description: true
        }
      }
    },
    orderBy: { issuedAt: 'desc' }
  })

  return NextResponse.json({ certificates })
}
