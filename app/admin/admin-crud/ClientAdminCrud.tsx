'use client'

import { useEffect, useMemo, useState } from 'react'
import { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import AdminMarketing from '../../../components/AdminMarketing'
import { useI18n } from '../../../components/LanguageProvider'
import { formatMoney } from '../../../lib/i18n/format'

type Category = {
  id: string
  name: string
  icon: string | null
  imageUrl: string | null
  createdAt: string
}

type Course = {
  id: string
  title: string
  description: string
  workloadHours: number
  pdfUrl: string
  thumbnailUrl: string | null
  syllabus: string | null
  seoTitle: string | null
  seoDescription: string | null
  category: { id: string; name: string; icon?: string | null; imageUrl?: string | null }
  categoryId: string
}

type Toast = { type: 'success' | 'error'; message: string } | null

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      {children}
    </label>
  )
}

export default function ClientAdminCrud() {
  const { t, language } = useI18n()
  const [tab, setTab] = useState<'categories' | 'courses' | 'marketing' | 'affiliates'>('categories')
  const [commissions, setCommissions] = useState<
    Array<{
      id: string
      amount: number
      status: string
      createdAt: string
      affiliate: { user: { name: string; email: string } }
      referredUser: { name: string; email: string }
    }>
  >([])
  const [commissionBusy, setCommissionBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const [stats, setStats] = useState<{
    totalUsers: number
    revenueUsd: number
    activeSubscriptions: number
    totalEnrollments: number
    completedEnrollments: number
    completionRatePercent: number
    affiliateReferrals: number
    pendingCommissionUsd: number
  } | null>(null)

  // Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('')
  const [catImageUrl, setCatImageUrl] = useState('')
  const [catBusy, setCatBusy] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingCategoryIcon, setEditingCategoryIcon] = useState('')
  const [editingCategoryImageUrl, setEditingCategoryImageUrl] = useState('')

  // Courses
  const [courses, setCourses] = useState<any[]>([])
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    pdfUrl: '',
    thumbnailUrl: '',
    syllabus: '',
    workloadHours: 1,
    seoTitle: '',
    seoDescription: '',
  })
  const [courseBusy, setCourseBusy] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => c.id === courseForm.categoryId)?.name ?? ''
  }, [categories, courseForm.categoryId])

  const displayToast = (toast: Toast) => {
    setToast(toast)
    if (toast) {
      window.setTimeout(() => setToast(null), 2500)
    }
  }

  async function fetchCategories() {
    const res = await fetch('/api/admin/categories')
    if (!res.ok) throw new Error('Failed to load categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  async function fetchCourses() {
    const res = await fetch('/api/admin/courses')
    if (!res.ok) throw new Error('Failed to load courses')
    const data = await res.json()
    setCourses(data.courses || [])
  }

  async function fetchCommissions() {
    const res = await fetch('/api/admin/commissions')
    if (!res.ok) throw new Error('Failed to load commissions')
    const data = await res.json()
    setCommissions(data.commissions || [])
  }

  async function approveCommission(id: string) {
    setCommissionBusy(id)
    try {
      const res = await fetch('/api/admin/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'PAID' }),
      })
      if (!res.ok) throw new Error('Failed to update commission')
      await fetchCommissions()
      displayToast({ type: 'success', message: t('admin.approveCommission') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : 'Error',
      })
    } finally {
      setCommissionBusy(null)
    }
  }

  useEffect(() => {
    fetchCategories().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadCategories') }))
    fetchCourses().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadCourses') }))
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.totalUsers === 'number') setStats(d)
      })
      .catch(() => {})
  }, [])

  async function createCategory() {
    if (!catName.trim()) {
      displayToast({ type: 'error', message: t('admin.categoryNameRequired') })
      return
    }

    setCatBusy(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName.trim(),
          icon: catIcon.trim() || null,
          imageUrl: catImageUrl.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || t('admin.failedCreateCategory'))

      setCatName('')
      setCatIcon('')
      setCatImageUrl('')
      await fetchCategories()
      displayToast({ type: 'success', message: t('admin.categoryCreated') })
    } catch (e: any) {
      displayToast({ type: 'error', message: e?.message || t('admin.failedCreateCategory') })
    } finally {
      setCatBusy(false)
    }
  }

  async function updateCategory() {
    if (!editingCategoryId) return
    if (!editingCategoryName.trim()) {
      displayToast({ type: 'error', message: t('admin.categoryNameRequired') })
      return
    }

    setCatBusy(true)
    try {
      const res = await fetch(`/api/admin/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCategoryName.trim(),
          icon: editingCategoryIcon.trim() || null,
          imageUrl: editingCategoryImageUrl.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || t('admin.failedUpdateCategory'))

      setEditingCategoryId(null)
      setEditingCategoryName('')
      setEditingCategoryIcon('')
      setEditingCategoryImageUrl('')
      await fetchCategories()
      displayToast({ type: 'success', message: t('admin.categoryUpdated') })
    } catch (e: any) {
      displayToast({ type: 'error', message: e?.message || t('admin.failedUpdateCategory') })
    } finally {
      setCatBusy(false)
    }
  }

  async function deleteCategory(categoryId: string) {
    if (!window.confirm(t('admin.confirmDeleteCategory'))) return

    setCatBusy(true)
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || t('admin.failedDeleteCategory'))

      if (courseForm.categoryId === categoryId) {
        setCourseForm((p) => ({ ...p, categoryId: '' }))
      }

      await fetchCategories()
      await fetchCourses()
      displayToast({ type: 'success', message: t('admin.categoryDeleted') })
    } catch (e: any) {
      displayToast({ type: 'error', message: e?.message || t('admin.failedDeleteCategory') })
    } finally {
      setCatBusy(false)
    }
  }

  function beginEditCourse(course: any) {
    setEditingCourseId(course.id)
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      categoryId: course.categoryId || course.category?.id || '',
      pdfUrl: course.pdfUrl || '',
      thumbnailUrl: course.thumbnailUrl || '',
      syllabus: course.syllabus || '',
      workloadHours: course.workloadHours ?? 1,
      seoTitle: course.seoTitle || '',
      seoDescription: course.seoDescription || '',
    })
  }

  function resetCourseForm() {
    setEditingCourseId(null)
    setCourseForm({
      title: '',
      description: '',
      categoryId: '',
      pdfUrl: '',
      thumbnailUrl: '',
      syllabus: '',
      workloadHours: 1,
      seoTitle: '',
      seoDescription: '',
    })
  }

  async function submitCourse() {
    if (!courseForm.title.trim()) return displayToast({ type: 'error', message: t('admin.titleRequired') })
    if (!courseForm.description.trim()) return displayToast({ type: 'error', message: t('admin.descriptionRequired') })
    if (!courseForm.categoryId) return displayToast({ type: 'error', message: t('admin.categoryRequired') })
    if (!courseForm.pdfUrl.trim()) return displayToast({ type: 'error', message: t('admin.pdfUrlRequired') })

    setCourseBusy(true)
    try {
      const payload = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        categoryId: courseForm.categoryId,
        pdfUrl: courseForm.pdfUrl.trim(),
        thumbnailUrl: courseForm.thumbnailUrl.trim() ? courseForm.thumbnailUrl.trim() : null,
        syllabus: courseForm.syllabus.trim() ? courseForm.syllabus.trim() : null,
        workloadHours: Number(courseForm.workloadHours || 0),
        seoTitle: courseForm.seoTitle.trim() ? courseForm.seoTitle.trim() : null,
        seoDescription: courseForm.seoDescription.trim() ? courseForm.seoDescription.trim() : null,
      }

      const url = editingCourseId ? `/api/admin/courses/${editingCourseId}` : '/api/admin/courses'
      const method = editingCourseId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || t('admin.failedSaveCourse'))

      await fetchCourses()
      resetCourseForm()
      displayToast({
        type: 'success',
        message: editingCourseId ? t('admin.courseUpdated') : t('admin.courseCreated'),
      })
    } catch (e: any) {
      displayToast({ type: 'error', message: e?.message || t('admin.failedSaveCourse') })
    } finally {
      setCourseBusy(false)
    }
  }

  async function deleteCourse(courseId: string) {
    if (!window.confirm(t('admin.confirmDeleteCourse'))) return

    setCourseBusy(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || t('admin.failedDeleteCourse'))

      await fetchCourses()
      if (editingCourseId === courseId) resetCourseForm()
      displayToast({ type: 'success', message: t('admin.courseDeleted') })
    } catch (e: any) {
      displayToast({ type: 'error', message: e?.message || t('admin.failedDeleteCourse') })
    } finally {
      setCourseBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {toast && (
        <div
          className={`mb-4 rounded border px-4 py-2 text-sm ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <a
          href="/api/admin/leads"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          {t('admin.exportLeads')}
        </a>
      </div>

      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase text-blue-900">{t('admin.users')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stats.totalUsers}</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase text-blue-900">{t('admin.revenue')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatMoney(stats.revenueUsd, language)}</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase text-blue-900">{t('admin.activeSubscriptions')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stats.activeSubscriptions}</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase text-blue-900">{t('admin.completionRate')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stats.completionRatePercent}%</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase text-blue-900">{t('admin.enrollments')}</p>
            <p className="mt-1 text-sm text-slate-700">
              {t('admin.enrollmentsSummary', {
                completed: stats.completedEnrollments,
                total: stats.totalEnrollments,
                completedLabel: t('admin.completed'),
              })}
            </p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase text-blue-900">{t('admin.affiliateReferrals')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stats.affiliateReferrals}</p>
          </div>
          <div className={`${siteCardClass} p-4 sm:col-span-2`}>
            <p className="text-xs font-bold uppercase text-blue-900">{t('admin.pendingCommissions')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatMoney(Math.round(stats.pendingCommissionUsd * 100), language)}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={siteTitleClass}>{t('admin.panel')}</h1>
          <p className={`${siteMutedClass} mt-2`}>{t('admin.panelSubtitle')}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('categories')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'categories' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabCategories')}
          </button>
          <button
            onClick={() => setTab('courses')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'courses' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabCourses')}
          </button>
          <button
            onClick={() => setTab('marketing')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'marketing' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabMarketing')}
          </button>
          <button
            onClick={() => {
              setTab('affiliates')
              fetchCommissions().catch(() =>
                displayToast({ type: 'error', message: t('admin.noCommissions') })
              )
            }}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'affiliates' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabAffiliates')}
          </button>
        </div>
      </div>

      {tab === 'marketing' && <AdminMarketing />}

      {tab === 'affiliates' && (
        <div className={`${siteCardClass} p-6`}>
          <h2 className="text-xl font-semibold mb-4">{t('admin.tabAffiliates')}</h2>
          {commissions.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noCommissions')}</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {commissions.map((c) => (
                <li key={c.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {c.affiliate.user.name} → {c.referredUser.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatMoney(Math.round(c.amount * 100), language)} · {c.status} ·{' '}
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {c.status === 'PENDING' ? (
                    <button
                      type="button"
                      disabled={commissionBusy === c.id}
                      onClick={() => approveCommission(c.id)}
                      className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {t('admin.approveCommission')}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('admin.createCategory')}</h2>

            <div className="space-y-3">
              <Field label={t('admin.name')}>
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder={t('admin.namePlaceholder')}
                />
              </Field>
              <Field label={t('admin.iconOptional')}>
                <input
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder={t('admin.iconPlaceholder')}
                />
              </Field>
              <Field label={t('admin.cardImageUrl')}>
                <input
                  value={catImageUrl}
                  onChange={(e) => setCatImageUrl(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="https://…"
                />
              </Field>

              <button
                disabled={catBusy}
                onClick={createCategory}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {catBusy ? t('admin.working') : t('admin.create')}
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('admin.allCategories')}</h2>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-gray-600">{t('admin.noCategories')}</p>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className="flex flex-col gap-2 rounded border p-3">
                    {editingCategoryId === c.id ? (
                      <>
                        <input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="w-full rounded border px-3 py-2"
                          placeholder={t('admin.name')}
                        />
                        <input
                          value={editingCategoryIcon}
                          onChange={(e) => setEditingCategoryIcon(e.target.value)}
                          className="w-full rounded border px-3 py-2"
                          placeholder={t('admin.iconPlaceholder')}
                        />
                        <input
                          value={editingCategoryImageUrl}
                          onChange={(e) => setEditingCategoryImageUrl(e.target.value)}
                          className="w-full rounded border px-3 py-2"
                          placeholder={t('admin.cardImageUrl')}
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={catBusy}
                            onClick={updateCategory}
                            className="flex-1 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {t('admin.save')}
                          </button>
                          <button
                            disabled={catBusy}
                            onClick={() => {
                              setEditingCategoryId(null)
                              setEditingCategoryName('')
                              setEditingCategoryIcon('')
                              setEditingCategoryImageUrl('')
                            }}
                            className="rounded border px-3 py-2 hover:bg-gray-50"
                          >
                            {t('admin.cancel')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">{c.name}</div>
                            {(c.icon || c.imageUrl) && (
                              <div className="mt-1 text-xs text-gray-500">
                                {c.icon ? (
                                  <span>
                                    {t('admin.iconLabel')} {c.icon}
                                  </span>
                                ) : null}
                                {c.icon && c.imageUrl ? ' · ' : null}
                                {c.imageUrl ? <span className="break-all">{t('admin.imageSet')}</span> : null}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">{c.id}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              disabled={catBusy}
                              onClick={() => {
                                setEditingCategoryId(c.id)
                                setEditingCategoryName(c.name)
                                setEditingCategoryIcon(c.icon ?? '')
                                setEditingCategoryImageUrl(c.imageUrl ?? '')
                              }}
                              className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              {t('admin.edit')}
                            </button>
                            <button
                              disabled={catBusy}
                              onClick={() => deleteCategory(c.id)}
                              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                            >
                              {t('admin.delete')}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {editingCourseId ? t('admin.editCourse') : t('admin.createCourse')}
            </h2>

            <div className="space-y-4">
              <Field label={t('admin.title')}>
                <input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                />
              </Field>

              <Field label={t('admin.description')}>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={4}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('admin.category')}>
                  <select
                    value={courseForm.categoryId}
                    onChange={(e) => setCourseForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  >
                    <option value="">{t('admin.selectCategory')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t('admin.workloadHours')}>
                  <input
                    type="number"
                    min={0}
                    value={courseForm.workloadHours}
                    onChange={(e) => setCourseForm((p) => ({ ...p, workloadHours: Number(e.target.value) }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </Field>
              </div>

              <Field label={t('admin.pdfUrl')}>
                <input
                  value={courseForm.pdfUrl}
                  onChange={(e) => setCourseForm((p) => ({ ...p, pdfUrl: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="https://..."
                />
              </Field>

              <Field label={t('admin.thumbnailOptional')}>
                <input
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                />
              </Field>

              <Field label={t('admin.syllabusOptional')}>
                <textarea
                  value={courseForm.syllabus}
                  onChange={(e) => setCourseForm((p) => ({ ...p, syllabus: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('admin.seoTitleOptional')}>
                  <input
                    value={courseForm.seoTitle}
                    onChange={(e) => setCourseForm((p) => ({ ...p, seoTitle: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </Field>

                <Field label={t('admin.seoDescOptional')}>
                  <input
                    value={courseForm.seoDescription}
                    onChange={(e) => setCourseForm((p) => ({ ...p, seoDescription: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </Field>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={courseBusy}
                  onClick={submitCourse}
                  className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {courseBusy ? t('admin.saving') : editingCourseId ? t('admin.update') : t('admin.create')}
                </button>
                <button
                  disabled={courseBusy}
                  onClick={resetCourseForm}
                  className="rounded border px-4 py-2 hover:bg-gray-50"
                >
                  {t('admin.reset')}
                </button>
              </div>

              <div className="text-xs text-gray-500">
                {t('admin.selectedCategory')} {selectedCategoryName || '—'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('admin.allCourses')}</h2>
            <div className="space-y-3">
              {courses.length === 0 ? (
                <p className="text-gray-600">{t('admin.noCourses')}</p>
              ) : (
                courses.map((c) => (
                  <div key={c.id} className="rounded border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{c.title}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {c.category?.name} • {c.workloadHours}h
                        </div>
                        <div className="text-xs text-gray-400 mt-2 break-all">{c.pdfUrl}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          disabled={courseBusy}
                          onClick={() => beginEditCourse(c)}
                          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          {t('admin.edit')}
                        </button>
                        <button
                          disabled={courseBusy}
                          onClick={() => deleteCourse(c.id)}
                          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                        >
                          {t('admin.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

