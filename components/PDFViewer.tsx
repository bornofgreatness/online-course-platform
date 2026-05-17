'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useI18n } from './LanguageProvider'

type ProgressState = {
  completed: boolean
  lastPage: number
}

export default function PDFViewer({
  url,
  title,
  courseId,
  initialProgress
}: {
  url: string
  title: string
  courseId: string
  initialProgress: ProgressState
}) {
  const { data: session } = useSession()
  const { t } = useI18n()

  // Note: this app stores `lastPage` as a logical value. Since we’re using
  // the default <iframe> PDF renderer, we don’t have reliable page-level
  // events. We track progress based on scroll position and allow marking complete.

  const [progress, setProgress] = useState<ProgressState>(initialProgress)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const saveProgress = async (next: ProgressState) => {
    if (saving) return
    if (!session) return

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, progress: next })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save progress')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  const logicalPageCount = 10
  const maxLogicalProgress = logicalPageCount - 1

  const logicalProgressFromScroll = () => {
    const el = containerRef.current
    if (!el) return progress.lastPage

    const rect = el.getBoundingClientRect()
    // Use scrollTop inside the container
    const scrollTop = el.scrollTop
    const scrollableHeight = el.scrollHeight - el.clientHeight

    if (scrollableHeight <= 0) return progress.lastPage

    const ratio = Math.min(1, Math.max(0, scrollTop / scrollableHeight))
    const lastPage = Math.round(ratio * maxLogicalProgress)
    return lastPage
  }

  const scheduleSave = (next: ProgressState) => {
    setProgress(next)

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveProgress(next)
    }, 800)
  }

  useEffect(() => {
    if (!mounted) return

    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const nextLastPage = logicalProgressFromScroll()
      const currentLastPage = progress.lastPage

      // Only move forward
      if (nextLastPage <= currentLastPage) return

      const next: ProgressState = {
        completed: progress.completed,
        lastPage: nextLastPage
      }

      scheduleSave(next)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, progress.lastPage, progress.completed])

  const percent = useMemo(() => {
    if (progress.completed) return 100
    return Math.round((progress.lastPage / maxLogicalProgress) * 90)
  }, [progress.completed, progress.lastPage])

  const markComplete = async () => {
    const next: ProgressState = { completed: true, lastPage: maxLogicalProgress }
    scheduleSave(next)

    // Ensure immediate save when completing.
    await saveProgress(next)
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{t('course.progress')}: {percent}%</p>
        </div>

        <div className="min-w-[140px] text-right">
          <div className="text-sm text-gray-500">{t('course.status')}</div>
          <div className="font-semibold text-gray-900">
            {progress.completed ? t('course.completed') : saving ? t('common.saving') : t('common.learning')}
          </div>
        </div>
      </div>

      {error && <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${progress.completed ? 'bg-green-600' : 'bg-blue-600'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="h-[70vh] w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50"
        >
          {/* In-browser viewing */}
          <iframe
            title={title}
            src={url}
            className="w-full min-h-[900px]"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-600 hover:underline text-sm"
          >
            {t('course.openPdf')}
          </a>

          <button
            type="button"
            onClick={markComplete}
            disabled={progress.completed}
            className="rounded bg-green-600 px-4 py-2 text-white text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {progress.completed ? t('course.completed') : t('course.markComplete')}
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {t('course.viewerNote')}
      </div>
    </section>
  )
}

