'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass } from '../../components/PageShell'
import CertificateShowcase from '../../components/CertificateShowcase'
import { certificatePdfDownloadPath } from '../../lib/certificateDownload'
import { useI18n } from '../../components/LanguageProvider'

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
  const { t, language } = useI18n()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)

  const isAuthenticated = status === 'authenticated' && !!session

  useEffect(() => {
    if (!isAuthenticated) {
      setCertificates([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetch('/api/certificates')
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data.certificates || [])
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  return (
    <>
      <Header />
      <PageShell className="mx-auto max-w-6xl">
        {!isAuthenticated ? (
          <CertificateShowcase />
        ) : (
          <>
            <div className="mb-10 flex flex-col gap-4 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                  {t('certificate.brandName')}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-blue-950">{t('common.myCertificates')}</h1>
                <p className={`${siteMutedClass} mt-2 max-w-lg`}>
                  {t('common.viewAndDownloadCertificates')}
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
              >
                ← {t('common.backToDashboard')}
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${siteCardClass} h-72 animate-pulse bg-slate-100`} />
                ))}
              </div>
            ) : certificates.length === 0 ? (
              <div className={`${siteCardClass} flex flex-col items-center px-8 py-16 text-center`}>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-teal-100 text-4xl">
                  🏆
                </div>
                <h2 className="mt-6 text-xl font-bold text-blue-950">{t('common.noCertificatesYet')}</h2>
                <p className={`${siteMutedClass} mt-2 max-w-md`}>{t('common.completeCourseToEarn')}</p>
                <Link
                  href="/courses"
                  className="mt-8 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  {t('common.browseCourses')}
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((certificate) => (
                  <article
                    key={certificate.id}
                    className={`${siteCardClass} group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl`}
                  >
                    <div className="bg-gradient-to-r from-blue-900 to-teal-800 px-5 py-4 text-white">
                      <p className="text-xs font-medium uppercase tracking-wide text-teal-200">
                        {t('certificate.brandName')}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug">
                        {certificate.course.title}
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="font-mono text-xs text-slate-500">
                        {t('common.certificateNumber', { number: certificate.certificateNumber })}
                      </p>
                      <div className="my-4 flex justify-center rounded-xl bg-slate-50 py-4">
                        <img
                          src={certificate.qrCode}
                          alt=""
                          className="h-24 w-24 transition group-hover:scale-105"
                        />
                      </div>
                      <p className="text-center text-xs text-slate-500">
                        {t('common.issued')}{' '}
                        {new Date(certificate.issuedAt).toLocaleDateString(
                          language === 'pt' ? 'pt-BR' : 'en-US'
                        )}
                      </p>
                      <div className="mt-4 flex flex-col gap-2">
                        <a
                          href={certificatePdfDownloadPath(
                            certificate.certificateNumber,
                            certificate.pdfUrl
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          {t('common.downloadPdf')}
                        </a>
                        <Link
                          href={`/verify/certificate/${encodeURIComponent(certificate.certificateNumber)}`}
                          className="rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                        >
                          {t('common.verify')}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </PageShell>
    </>
  )
}
