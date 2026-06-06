'use client'

import { useCallback, useEffect, useState } from 'react'
import LoadingButtonLabel from '../LoadingButtonLabel'
import LoadingImage from '../LoadingImage'
import { useI18n } from '../LanguageProvider'
import {
  buildDefaultQuizPayload,
  isQuizDraftComplete,
  normalizeQuizDraft,
  QUIZ_MAX_QUESTIONS,
  type QuizQuestion,
} from '../../lib/quiz'
import { siteInsetPanelClass } from '../../lib/ui/siteStyles'
import {
  adminActionBtnClass,
  adminCardClass,
  adminInputClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from './adminStyles'

type AdminQuizEditorProps = {
  quizId: string
  courseTitle: string
  onSaved: () => void
  onCancel: () => void
}

function cloneQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map((q) => ({
    ...q,
    options: [...q.options] as [string, string, string, string],
  }))
}

export default function AdminQuizEditor({
  quizId,
  courseTitle,
  onSaved,
  onCancel,
}: AdminQuizEditorProps) {
  const { t } = useI18n()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`)
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || t('admin.failedLoadQuizzes'))

      const loaded = Array.isArray(json?.quiz?.questions) ? json.quiz.questions : null
      if (loaded?.length === QUIZ_MAX_QUESTIONS) {
        setQuestions(cloneQuestions(loaded))
      } else {
        setQuestions(cloneQuestions(buildDefaultQuizPayload().questions))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('admin.failedLoadQuizzes'))
      setQuestions(cloneQuestions(buildDefaultQuizPayload().questions))
    } finally {
      setLoading(false)
    }
  }, [quizId, t])

  useEffect(() => {
    void load()
  }, [load])

  const updatePrompt = (index: number, prompt: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, prompt } : q)))
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q
        const options = [...q.options] as [string, string, string, string]
        options[optionIndex] = value
        return { ...q, options }
      })
    )
  }

  const updateCorrectIndex = (questionIndex: number, correctIndex: 0 | 1 | 2 | 3) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === questionIndex ? { ...q, correctIndex } : q))
    )
  }

  const save = async () => {
    const payload = normalizeQuizDraft(questions)
    if (!payload) {
      setError(t('admin.quizFillAllFields'))
      return
    }

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: payload }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || t('admin.failedUpdateQuiz'))
      setQuestions(cloneQuestions(payload.questions))
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('admin.failedUpdateQuiz'))
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = async () => {
    if (!window.confirm(t('admin.confirmResetQuizDefault'))) return

    setResetting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useDefault: true }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || t('admin.failedUpdateQuiz'))
      await load()
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('admin.failedUpdateQuiz'))
    } finally {
      setResetting(false)
    }
  }

  const draftComplete = isQuizDraftComplete(questions)
  const busy = saving || resetting

  return (
    <div className={`${adminCardClass} ring-2 ring-blue-200/80`}>
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{t('admin.editQuiz')}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{courseTitle}</h2>
          <p className={`mt-1 text-sm text-slate-600`}>{t('admin.quizEditorHint')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={onCancel} disabled={busy} className={adminSecondaryBtnClass}>
            {t('admin.cancel')}
          </button>
          <button
            type="button"
            onClick={resetToDefault}
            disabled={busy}
            className={adminActionBtnClass}
          >
            <LoadingButtonLabel loading={resetting} label={t('common.loading')}>
              {t('admin.quizResetDefault')}
            </LoadingButtonLabel>
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !draftComplete}
            className={adminPrimaryBtnClass}
          >
            <LoadingButtonLabel loading={saving} label={t('common.loading')}>
              {t('admin.quizSave')}
            </LoadingButtonLabel>
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}

      {loading ? (
        <LoadingImage size="lg" label={t('common.loading')} className="py-12" />
      ) : (
        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
            <article key={question.id} className={siteInsetPanelClass}>
              <h3 className="text-sm font-bold text-blue-950">
                {t('admin.quizQuestionLabel', { number: questionIndex + 1 })}
              </h3>

              <label className="mt-3 block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.quizPrompt')}
                </span>
                <textarea
                  value={question.prompt}
                  onChange={(e) => updatePrompt(questionIndex, e.target.value)}
                  rows={2}
                  className={`${adminInputClass} mt-1`}
                />
              </label>

              <fieldset className="mt-4 space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.quizCorrectAnswer')}
                </legend>
                {question.options.map((option, optionIndex) => (
                  <div
                    key={`${question.id}-opt-${optionIndex}`}
                    className="flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-white p-3 sm:flex-row sm:items-center"
                  >
                    <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name={`quiz-correct-${quizId}-${question.id}`}
                        checked={question.correctIndex === optionIndex}
                        onChange={() => updateCorrectIndex(questionIndex, optionIndex as 0 | 1 | 2 | 3)}
                        className="h-4 w-4 text-blue-600"
                      />
                      {t('admin.quizOptionLabel', { number: optionIndex + 1 })}
                    </label>
                    <input
                      value={option}
                      onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                      className={`${adminInputClass} mt-0 sm:flex-1`}
                    />
                  </div>
                ))}
              </fieldset>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
