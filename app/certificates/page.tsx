'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'
import { certificatePdfDownloadPath } from '../../lib/certificateDownload'

interface Certificate {
  id: string
  certificateNumber: string
  issuedAt: string
  pdfUrl: string
  qrCode: string
  course: {
    title: string
    description: string
  }
}

export default function Certificates() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetch('/api/certificates')
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data.certificates || [])
      })
      .finally(() => setLoading(false))
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <PageShell>
          <p className={siteMutedClass}>Loading…</p>
        </PageShell>
      </>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-8">
          <h1 className={siteTitleClass}>My certificates</h1>
          <p className={`${siteMutedClass} mt-2`}>View and download your course completion certificates.</p>
          <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        {certificates.length === 0 ? (
          <div className={`${siteCardClass} p-10 text-center`}>
            <div className="mb-4 text-5xl">🏆</div>
            <h2 className="text-lg font-bold text-blue-950">No certificates yet</h2>
            <p className={`${siteMutedClass} mx-auto mt-2 max-w-md`}>Complete a course to earn your first certificate.</p>
            <Link
              href="/courses"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <div key={certificate.id} className={`${siteCardClass} p-5 sm:p-6`}>
                <div className="mb-4 text-center">
                  <div className="mb-2 text-4xl">🎓</div>
                  <h3 className="text-base font-bold text-blue-950">{certificate.course.title}</h3>
                  <p className="text-xs text-slate-500">Certificate #{certificate.certificateNumber}</p>
                </div>

                <div className="mb-4 flex justify-center">
                  <img src={certificate.qrCode} alt="Certificate QR Code" className="h-20 w-20" />
                </div>

                <div className="mb-4 text-center text-xs text-slate-500">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a
                      href={certificatePdfDownloadPath(certificate.certificateNumber, certificate.pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Download PDF
                    </a>
                    <Link
                      href={`/verify/certificate/${encodeURIComponent(certificate.certificateNumber)}`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Verify
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const path = certificatePdfDownloadPath(certificate.certificateNumber, certificate.pdfUrl)
                      const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path
                      navigator.share?.({
                        title: `Certificate for ${certificate.course.title}`,
                        text: `I completed the course: ${certificate.course.title}`,
                        url,
                      })
                    }}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}
