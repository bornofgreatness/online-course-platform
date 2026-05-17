import Header from '../../../../components/Header'
import VerifyCertificateView, { type VerifyData } from '../../../../components/views/VerifyCertificateView'
import { getPrisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

interface Props {
  params: { certificateNumber: string }
}

export default async function VerifyCertificatePage({ params }: Props) {
  const num = decodeURIComponent(params.certificateNumber || '').trim()

  let data: VerifyData = { valid: false }

  if (num && process.env.DATABASE_URL) {
    try {
      const prisma = getPrisma()
      const cert = await prisma.certificate.findUnique({
        where: { certificateNumber: num },
        include: {
          course: { select: { title: true, workloadHours: true } },
          user: { select: { name: true } },
        },
      })
      if (cert) {
        data = {
          valid: true,
          certificateNumber: cert.certificateNumber,
          courseName: cert.course.title,
          workloadHours: cert.course.workloadHours,
          issuedAt: cert.issuedAt.toISOString(),
          holderName: cert.user.name,
        }
      }
    } catch {
      data = { valid: false }
    }
  }

  return (
    <>
      <Header />
      <VerifyCertificateView num={num} data={data} />
    </>
  )
}
