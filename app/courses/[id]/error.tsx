'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteLinkClass, siteMutedClass } from '../../../components/PageShell'
import { useI18n } from '../../../components/LanguageProvider'

export default function CourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    console.error('Course page error:', error)
  }, [error])

  return (
    <>
      <Header />
      <PageShell>
        <div className={`${siteCardClass} mx-auto max-w-lg p-6 text-center`}>
          <h1 className="text-xl font-bold text-blue-950">{t('common.error')}</h1>
          <p className={`${siteMutedClass} mt-3`}>{t('course.loadFailed')}</p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-slate-400">ID: {error.digest}</p>
          ) : null}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t('common.tryAgain')}
            </button>
            <Link href="/courses" className={siteLinkClass}>
              {t('common.backToCourses')}
            </Link>
          </div>
        </div>
      </PageShell>
    </>
  )
}
