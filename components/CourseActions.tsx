'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EnrollButton from './EnrollButton'

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
        alert((data as { error?: string }).error || 'Failed to mark course as complete')
      }
    } catch {
      alert('Error updating progress')
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
        alert(data.error || 'Failed to generate certificate')
      }
    } catch {
      alert('Error generating certificate')
    }
    setLoading(false)
  }

  if (!isEnrolled) {
    return <EnrollButton courseId={courseId} />
  }

  if (subscriptionBlocked) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-amber-900">Your subscription is inactive or has expired.</p>
        <p className="text-slate-600">Renew to access course materials, the quiz, and progress tracking.</p>
        <Link
          href="/pricing"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          View plans
        </Link>
      </div>
    )
  }

  const quizGateActive = quizExists && !quizPassed && !progress.completed
  const canMarkComplete = !quizGateActive && !progress.completed

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="font-medium">Progress:</span> {progress.completed ? 'Completed' : 'In progress'}
      </div>

      {quizGateActive && (
        <p className="text-sm text-slate-700">
          Pass the{' '}
          <a href="#course-quiz" className="font-semibold text-blue-600 underline">
            course quiz
          </a>{' '}
          (7/10 or higher) before marking complete.
        </p>
      )}

      {hasCertificate ? (
        <div className="text-center">
          <div className="mb-2 font-semibold text-green-600">✓ Certificate earned</div>
          <a
            href="/certificates"
            className="inline-block rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            View certificate
          </a>
        </div>
      ) : progress.completed ? (
        <button
          type="button"
          onClick={handleGenerateCertificate}
          disabled={loading}
          className="w-full rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate certificate'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={loading || !canMarkComplete}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Updating…' : 'Mark as complete'}
        </button>
      )}
    </div>
  )
}
