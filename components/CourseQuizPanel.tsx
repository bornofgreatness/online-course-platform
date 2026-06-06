'use client'

import { useCallback, useEffect, useState } from 'react'
import { useI18n } from './LanguageProvider'
import LoadingButtonLabel from './LoadingButtonLabel'
import LoadingImage from './LoadingImage'
import { sitePanelClass, sitePrimaryBtnClass } from '../lib/ui/siteStyles'

type QuizQuestion = { id: string; prompt: string; options: string[] }

type QuizPayload = {
  quiz: { questions: QuizQuestion[] } | null
  attemptsUsed: number
  maxAttempts: number
  bestScore: number | null
  passed: boolean
  history: Array<{ id: string; score: number; passed: boolean; attemptedAt: string }>
}

export default function CourseQuizPanel({ courseId }: { courseId: string }) {
  const { language, t } = useI18n()
  const [data, setData] = useState<QuizPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean; attemptsRemaining: number } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/courses/${courseId}/quiz?lang=${language}`)
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || t('quiz.failedLoad'))
      if (!json.quiz) {
        setData(null)
        return
      }
      setData({
        quiz: json.quiz,
        attemptsUsed: json.attemptsUsed,
        maxAttempts: json.maxAttempts,
        bestScore: json.bestScore,
        passed: json.passed,
        history: json.history || [],
      })
      setAnswers(new Array(json.quiz.questions.length).fill(0))
    } catch (e: any) {
      setError(e?.message || t('quiz.failedLoad'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [courseId, language, t])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    if (!data?.quiz) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/courses/${courseId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || t('quiz.submitFailed'))
      setResult({ score: json.score, passed: json.passed, attemptsRemaining: json.attemptsRemaining })
      // Dispatch custom event to notify other components (like CourseActions) that quiz state changed
      if (json.passed) {
        window.dispatchEvent(new CustomEvent('quiz-passed', { detail: { courseId } }))
      }
      await load()
    } catch (e: any) {
      setError(e?.message || t('quiz.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div id="course-quiz" className={`${sitePanelClass}`}>
        <LoadingImage size="sm" label={t('quiz.loading')} className="py-6" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div id="course-quiz" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        {error}
      </div>
    )
  }

  if (!data?.quiz) {
    return null
  }

  const exhausted = data.attemptsUsed >= data.maxAttempts && !data.passed
  const labels = ['A', 'B', 'C', 'D'] as const

  return (
    <div id="course-quiz" className={`sm:p-6 ${sitePanelClass}`}>
      <h2 className="text-lg font-bold uppercase tracking-wide text-blue-900 sm:text-xl">{t('quiz.courseQuiz')}</h2>
      <p className="mt-1 text-sm text-slate-600">
        {t('quiz.passingScore')}: 7/10 · {t('quiz.attemptsUsed')}: {data.attemptsUsed}/{data.maxAttempts}
        {data.passed ? <span className="ml-2 font-semibold text-emerald-700">· {t('quiz.passed')}</span> : null}
      </p>

      {data.history.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {data.history.slice(0, 3).map((h) => (
            <li key={h.id}>
              {new Date(h.attemptedAt).toLocaleString()}: {h.score}/10 {h.passed ? `(${t('quiz.passed').toLowerCase()})` : ''}
            </li>
          ))}
        </ul>
      )}

      {result && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${result.passed ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-100 text-slate-800'}`}>
          {t('quiz.score', { score: result.score })} - {result.passed ? t('quiz.passed') : t('quiz.notPassed')}.
          {result.attemptsRemaining > 0 && !result.passed ? ` ${t('quiz.attemptsLeft', { count: result.attemptsRemaining })}` : null}
        </p>
      )}

      {exhausted ? (
        <p className="mt-4 text-sm font-medium text-red-700">{t('quiz.maxAttempts')}</p>
      ) : data.passed ? (
        <p className="mt-4 text-sm text-emerald-800">{t('quiz.youPassed')}</p>
      ) : (
        <div className="mt-4 space-y-5">
          {data.quiz.questions.map((q, qi) => (
            <fieldset key={q.id} className="rounded-lg border border-slate-100 p-3">
              <legend className="px-1 text-sm font-semibold text-slate-900">
                {qi + 1}. {q.prompt}
              </legend>
              <div className="mt-2 space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      className="mt-1"
                      name={q.id}
                      checked={answers[qi] === oi}
                      onChange={() => {
                        setAnswers((prev) => {
                          const next = [...prev]
                          next[qi] = oi
                          return next
                        })
                      }}
                    />
                    <span>
                      <span className="font-semibold text-slate-900">{labels[oi]}.</span> {opt}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button
            type="button"
            disabled={submitting || exhausted}
            aria-busy={submitting}
            onClick={submit}
            className={`w-full ${sitePrimaryBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <LoadingButtonLabel loading={submitting} label={t('common.loading')}>
              {t('quiz.submit')}
            </LoadingButtonLabel>
          </button>
        </div>
      )}

      {error && data ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
