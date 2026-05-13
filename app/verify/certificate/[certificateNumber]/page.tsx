import Link from 'next/link'
import Header from '../../../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../../../components/PageShell'
import { getPrisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

interface Props {
  params: { certificateNumber: string }
}

export default async function VerifyCertificatePage({ params }: Props) {
  const num = decodeURIComponent(params.certificateNumber || '').trim()

  let data:
    | {
        valid: true
        certificateNumber: string
        courseName: string
        workloadHours: number
        issuedAt: string
        holderName: string
      }
    | { valid: false } = { valid: false }

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
      <PageShell>
        <h1 className={siteTitleClass}>Certificate verification</h1>
        <p className={`${siteMutedClass} mt-2 max-w-2xl`}>
          Public verification for certificates issued on this platform.
        </p>

        <div className={`${siteCardClass} mx-auto mt-8 max-w-xl p-6`}>
          {!num ? (
            <p className={siteMutedClass}>Missing certificate number.</p>
          ) : !data.valid ? (
            <p className="font-semibold text-red-700">This certificate could not be verified.</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</dt>
                <dd className="font-semibold text-emerald-700">Valid</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Certificate #</dt>
                <dd className="font-mono text-slate-900">{data.certificateNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Learner</dt>
                <dd className="text-slate-900">{data.holderName}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Course</dt>
                <dd className="text-slate-900">{data.courseName}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Workload</dt>
                <dd className="text-slate-900">{data.workloadHours} hours</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Issued</dt>
                <dd className="text-slate-900">{new Date(data.issuedAt).toLocaleString()}</dd>
              </div>
            </dl>
          )}
        </div>

        <p className="mt-8">
          <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Courses
          </Link>
        </p>
      </PageShell>
    </>
  )
}
