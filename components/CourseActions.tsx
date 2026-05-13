'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EnrollButton from './EnrollButton'
import { useI18n } from './LanguageProvider'

interface CourseActionsProps {
  courseId: string
  isEnrolled: boolean
  /** True when enrolled but subscription is missing/expired (non-admin). */
  subscriptionBlocked: boolean
  progress: { completed: boolean; lastPage: number }
  hasCertificate: boolean
  quizExists: boolean
  quizPassed: boolean
}

export default function CourseActions({
  courseId,
  isEnrolled,
  subscriptionBlocked,
  progress,
  hasCertificate,
  quizExists,
  quizPassed: initialQuizPassed,
}: CourseActionsProps) {
  const [loading, setLoading] = useState(false)
  const [quizPassed, setQuizPassed] = useState(initialQuizPassed)
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    const handleQuizPassed = (event: CustomEvent<{ courseId: string }>) => {
      if (event.detail.courseId === courseId) {
        setQuizPassed(true)
      }
    }

    window.addEventListener('quiz-passed', handleQuizPassed as EventListener)
    return () => {
      window.removeEventListener('quiz-passed', handleQuizPassed as EventListener)
    }
  }, [courseId])

  const handleMarkComplete = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          progress: { completed: true, lastPage: progress.lastPage },
        }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert((data as { error?: string }).error || t('actions.failedMarkComplete'))
      }
    } catch {
      alert(t('actions.errorUpdatingProgress'))
    }
    setLoading(false)
  }

  const handleGenerateCertificate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || t('actions.failedGenerateCertificate'))
      }
    } catch {
      alert(t('actions.errorGeneratingCertificate'))
    }
    setLoading(false)
  }

  if (!isEnrolled) {
    return <EnrollButton courseId={courseId} />
  }

  if (subscriptionBlocked) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-amber-900">{t('actions.subscriptionInactive')}</p>
        <p className="text-slate-600">{t('actions.renewAccess')}</p>
        <Link
          href="/pricing"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t('actions.viewPlans')}
        </Link>
      </div>
    )
  }

  const quizGateActive = quizExists && !quizPassed && !progress.completed
  const canMarkComplete = !quizGateActive && !progress.completed

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="font-medium">{t('course.progress')}:</span>{' '}
        {progress.completed ? t('course.completed') : t('course.inProgress')}
      </div>

      {quizGateActive && (
        <p className="text-sm text-slate-700">{t('actions.passQuizBeforeComplete')}</p>
      )}

      {hasCertificate ? (
        <div className="text-center">
          <div className="mb-2 font-semibold text-green-600">✓ {t('actions.certificateEarned')}</div>
          <a
            href="/certificates"
            className="inline-block rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            {t('actions.viewCertificate')}
          </a>
        </div>
      ) : progress.completed ? (
        <button
          type="button"
          onClick={handleGenerateCertificate}
          disabled={loading}
          className="w-full rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('actions.generating') : t('actions.generateCertificate')}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={loading || !canMarkComplete}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('actions.updating') : t('course.markComplete')}
        </button>
      )}
    </div>
  )
}
