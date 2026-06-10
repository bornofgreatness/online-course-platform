'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import PageShell, {
  siteCardClass,
  siteEyebrowClass,
  siteMutedClass,
  sitePageHeroClass,
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
      <header className={`${sitePageHeroClass} mb-5 sm:mb-6`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.15),transparent_50%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className={`${siteEyebrowClass} text-teal-300/90`}>{t('certificate.brandName')}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t('common.certificates')}</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-blue-100/90 sm:text-base">
              {t('certificate.hubIntro')}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="w-full shrink-0 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/20 sm:w-auto"
          >
            ← {t('common.backToDashboard')}
          </Link>
        </div>
      </header>

      <nav
        className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100/90 p-1 sm:mb-8 sm:flex sm:flex-wrap sm:gap-2 sm:rounded-none sm:bg-transparent sm:p-0"
        aria-label={t('common.certificates')}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setTab(tab)}
            className={[
              'min-h-[2.75rem] rounded-lg px-1.5 py-2 text-center text-[0.7rem] font-semibold leading-tight transition sm:min-h-0 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm',
              activeTab === tab
                ? 'bg-white text-blue-700 shadow-sm sm:bg-blue-600 sm:text-white sm:shadow-md sm:shadow-blue-600/20'
                : 'text-slate-600 hover:bg-white/70 sm:border sm:border-slate-200 sm:bg-white sm:text-slate-700 sm:hover:border-blue-200 sm:hover:bg-blue-50',
            ].join(' ')}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </nav>

      {subscriptionRequired ? (
        <div className={`${siteCardClass} p-6 text-center sm:p-8`}>
          <p className={siteMutedClass}>{t('certificate.subscriptionRequired')}</p>
          <Link href="/pricing" className={`${sitePrimaryBtnClass} mt-5 inline-flex w-full justify-center sm:mt-6 sm:w-auto`}>
            {t('common.subscription')}
          </Link>
        </div>
      ) : loading ? (
        <LoadingImage size="lg" label={t('common.loading')} className="py-12 sm:py-16" />
      ) : activeTab === 'mine' ? (
        certificates.length === 0 ? (
          <div className={`${siteCardClass} flex flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-16`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-teal-100 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
              🏆
            </div>
            <h2 className="mt-5 text-lg font-bold text-blue-950 sm:mt-6 sm:text-xl">{t('common.noCertificatesYet')}</h2>
            <p className={`${siteMutedClass} mt-2 max-w-md text-sm sm:text-base`}>{t('certificate.noIssuedYet')}</p>
            <button
              type="button"
              onClick={() => setTab('completed')}
              className={`${sitePrimaryBtnClass} mt-6 w-full sm:mt-8 sm:w-auto`}
            >
              {t('certificate.tabCompleted')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <article
                key={certificate.id}
                className={`${siteCardClass} group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl`}
              >
                <div className="bg-gradient-to-r from-blue-900 to-teal-800 px-4 py-3.5 text-white sm:px-5 sm:py-4">
                  <p className="text-[0.65rem] font-medium uppercase tracking-wide text-teal-200 sm:text-xs">
                    {t('certificate.brandName')}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug sm:text-base">
                    {certificate.courseTitle || certificate.course.title}
                  </h3>
                  <p className="mt-1 text-[0.7rem] text-blue-100/90 sm:text-xs">
                    {certificate.holderName || t('certificate.holderName')}
                    {' · '}
                    {certificate.workloadHours ?? certificate.course.workloadHours}h
                  </p>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="break-all font-mono text-[0.65rem] text-slate-500 sm:text-xs">
                    {t('common.certificateNumber', { number: certificate.certificateNumber })}
                  </p>
                  <div className="my-3 flex justify-center rounded-xl bg-slate-50 py-3 sm:my-4 sm:py-4">
                    <img
                      src={certificate.qrCode}
                      alt=""
                      className="h-20 w-20 transition group-hover:scale-105 sm:h-24 sm:w-24"
                    />
                  </div>
                  <p className="text-center text-[0.7rem] text-slate-500 sm:text-xs">
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
                      className={`${sitePrimaryBtnClass} w-full text-center`}
                    >
                      {t('common.downloadPdf')}
                    </a>
                    <Link
                      href={`/verify/certificate/${encodeURIComponent(certificate.certificateNumber)}`}
                      className={`${siteSecondaryBtnClass} w-full text-center`}
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
          <div className={`${siteCardClass} p-6 text-center sm:p-10 ${siteMutedClass}`}>
            {t('certificate.noCompletedPending')}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <CertificateLegalNotice compact className="px-0.5" />
            {completedCourses.map((course) => (
              <article key={course.courseId} className={`${siteCardClass} overflow-hidden`}>
                <div className="p-4 sm:p-6">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-snug text-blue-950 sm:text-lg">{course.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      {t('certificate.courseHours', { hours: course.workloadHours })}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{course.description}</p>
                    {!course.eligible && course.quizExists ? (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:text-sm">
                        {t('actions.passQuizBeforeComplete')}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-4 sm:mt-5">
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
        <div className={`${siteCardClass} p-6 text-center sm:p-10`}>
          <p className={siteMutedClass}>{t('certificate.noInProgress')}</p>
          <Link href="/courses" className={`${sitePrimaryBtnClass} mt-5 inline-flex w-full justify-center sm:mt-6 sm:w-auto`}>
            {t('common.browseCourses')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {inProgressCourses.map((course) => (
            <article key={course.courseId} className={`${siteCardClass} p-4 sm:p-5`}>
              <h3 className="text-base font-bold leading-snug text-blue-950 sm:text-lg">{course.title}</h3>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                {t('certificate.courseHours', { hours: course.workloadHours })}
              </p>
              <div className="mt-3 sm:mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-600 sm:text-sm">
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
                className={`${sitePrimaryBtnClass} mt-4 block w-full text-center text-sm`}
              >
                {t('common.continueLearning')}
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
