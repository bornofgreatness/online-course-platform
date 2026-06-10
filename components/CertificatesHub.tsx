'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import PageShell, {
  siteCardClass,
  siteLinkClass,
  siteMutedClass,
  sitePrimaryBtnClass,
  siteSecondaryBtnClass,
} from './PageShell'
import LoadingImage from './LoadingImage'
import CertificateRequestButton from './CertificateRequestButton'
import CertificateLegalNotice from './CertificateLegalNotice'
import { certificatePdfDownloadPath } from '../lib/certificateDownload'
import { useI18n } from './LanguageProvider'

type Tab = 'mine' | 'completed' | 'progress'

type CertificateRow = {
  id: string
  certificateNumber: string
  issuedAt: string
  pdfUrl: string
  qrCode: string
  holderName?: string | null
  courseTitle?: string | null
  workloadHours?: number | null
  course: { title: string; description: string; workloadHours: number }
}

type CompletedCourse = {
  courseId: string
  title: string
  description: string
  workloadHours: number
  thumbnailUrl?: string | null
  quizExists: boolean
  quizPassed: boolean
  feeLabel: string
  paymentRequired: boolean
  eligible: boolean
}

type InProgressCourse = {
  courseId: string
  title: string
  description: string
  workloadHours: number
  thumbnailUrl?: string | null
  progressPercent: number
}

const TABS: Tab[] = ['mine', 'completed', 'progress']

function tabClass(active: boolean) {
  return [
    'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
    active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
      : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50',
  ].join(' ')
}

export default function CertificatesHub() {
  const { t, language } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : 'mine'

  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<CertificateRow[]>([])
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([])
  const [inProgressCourses, setInProgressCourses] = useState<InProgressCourse[]>([])
  const [subscriptionRequired, setSubscriptionRequired] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/certificates/overview')
      const data = await res.json()
      if (res.ok) {
        setCertificates(data.certificates || [])
        setCompletedCourses(data.completedCourses || [])
        setInProgressCourses(data.inProgressCourses || [])
        setSubscriptionRequired(!!data.subscriptionRequired)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setTab = (tab: Tab) => {
    router.replace(`/certificates?tab=${tab}`, { scroll: false })
  }

  const tabLabels: Record<Tab, string> = {
    mine: t('certificate.tabMine'),
    completed: t('certificate.tabCompleted'),
    progress: t('certificate.tabInProgress'),
  }

  return (
    <PageShell className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
            {t('certificate.brandName')}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-blue-950">{t('common.certificates')}</h1>
          <p className={`${siteMutedClass} mt-2 max-w-lg`}>{t('certificate.hubIntro')}</p>
        </div>
        <Link href="/dashboard" className={`${siteSecondaryBtnClass} w-fit`}>
          ← {t('common.backToDashboard')}
        </Link>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2" aria-label={t('common.certificates')}>
        {TABS.map((tab) => (
          <button key={tab} type="button" onClick={() => setTab(tab)} className={tabClass(activeTab === tab)}>
            {tabLabels[tab]}
          </button>
        ))}
      </nav>

      {subscriptionRequired ? (
        <div className={`${siteCardClass} p-8 text-center`}>
          <p className={siteMutedClass}>{t('certificate.subscriptionRequired')}</p>
          <Link href="/pricing" className={`${sitePrimaryBtnClass} mt-6 inline-flex`}>
            {t('common.subscription')}
          </Link>
        </div>
      ) : loading ? (
        <LoadingImage size="lg" label={t('common.loading')} className="py-16" />
      ) : activeTab === 'mine' ? (
        certificates.length === 0 ? (
          <div className={`${siteCardClass} flex flex-col items-center px-8 py-16 text-center`}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-teal-100 text-4xl">
              🏆
            </div>
            <h2 className="mt-6 text-xl font-bold text-blue-950">{t('common.noCertificatesYet')}</h2>
            <p className={`${siteMutedClass} mt-2 max-w-md`}>{t('certificate.noIssuedYet')}</p>
            <button type="button" onClick={() => setTab('completed')} className={`${sitePrimaryBtnClass} mt-8`}>
              {t('certificate.tabCompleted')}
            </button>
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
                    {certificate.courseTitle || certificate.course.title}
                  </h3>
                  <p className="mt-1 text-xs text-blue-100/90">
                    {certificate.holderName || t('certificate.holderName')}
                    {' · '}
                    {certificate.workloadHours ?? certificate.course.workloadHours}h
                  </p>
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
                      href={certificatePdfDownloadPath(certificate.certificateNumber, certificate.pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${sitePrimaryBtnClass} text-center`}
                    >
                      {t('common.downloadPdf')}
                    </a>
                    <Link
                      href={`/verify/certificate/${encodeURIComponent(certificate.certificateNumber)}`}
                      className={`${siteSecondaryBtnClass} text-center`}
                    >
                      {t('common.verify')}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : activeTab === 'completed' ? (
        completedCourses.length === 0 ? (
          <div className={`${siteCardClass} p-10 text-center ${siteMutedClass}`}>
            {t('certificate.noCompletedPending')}
          </div>
        ) : (
          <div className="space-y-4">
            <CertificateLegalNotice compact />
            {completedCourses.map((course) => (
              <article key={course.courseId} className={`${siteCardClass} p-5 sm:p-6`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-blue-950">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {t('certificate.courseHours', { hours: course.workloadHours })}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p>
                    {!course.eligible && course.quizExists ? (
                      <p className="mt-3 text-sm text-amber-800">{t('actions.passQuizBeforeComplete')}</p>
                    ) : null}
                  </div>
                  <div className="w-full shrink-0 sm:w-56">
                    {course.eligible ? (
                      <CertificateRequestButton
                        courseId={course.courseId}
                        feeLabel={course.feeLabel}
                        onSuccess={load}
                      />
                    ) : (
                      <Link
                        href={`/courses/${course.courseId}`}
                        className={`${siteSecondaryBtnClass} block w-full text-center`}
                      >
                        {t('common.openCourse')}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : inProgressCourses.length === 0 ? (
        <div className={`${siteCardClass} p-10 text-center`}>
          <p className={siteMutedClass}>{t('certificate.noInProgress')}</p>
          <Link href="/courses" className={`${sitePrimaryBtnClass} mt-6 inline-flex`}>
            {t('common.browseCourses')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {inProgressCourses.map((course) => (
            <article key={course.courseId} className={`${siteCardClass} p-5`}>
              <h3 className="font-bold text-blue-950">{course.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {t('certificate.courseHours', { hours: course.workloadHours })}
              </p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm text-slate-600">
                  <span>{t('common.progress')}</span>
                  <span className="font-semibold tabular-nums">{course.progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>
              <Link
                href={`/courses/${course.courseId}`}
                className={`${siteLinkClass} mt-4 inline-block`}
              >
                {t('common.continueLearning')} →
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
