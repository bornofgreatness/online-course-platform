'use client'

import { useEffect, useMemo, useState } from 'react'
import { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import AdminMarketing from '../../../components/AdminMarketing'
import { useI18n } from '../../../components/LanguageProvider'
import { formatMoney } from '../../../lib/i18n/format'

type Subcategory = {
  id: string
  name: string
  categoryId: string
  _count?: { courses: number }
}

type Category = {
  id: string
  name: string
  icon: string | null
  imageUrl: string | null
  createdAt: string
  subcategories?: Subcategory[]
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
  subcategory?: { id: string; name: string } | null
  subcategoryId: string | null
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
  const [tab, setTab] = useState<'categories' | 'courses' | 'marketing' | 'affiliates' | 'users' | 'payments' | 'subscriptions' | 'certificates'>('categories')
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

  // Users
  const [users, setUsers] = useState<
    Array<{
      id: string
      email: string
      name: string
      whatsapp: string | null
      address: string | null
      city: string | null
      state: string | null
      role: string
      emailVerifiedAt: string | null
      createdAt: string
      _count: { enrollments: number; subscriptions: number; payments: number; certificates: number }
    }>
  >([])
  const [userBusy, setUserBusy] = useState<string | null>(null)

  // Payments
  const [payments, setPayments] = useState<
    Array<{
      id: string
      amount: number
      currency: string
      status: string
      provider: string
      externalId: string | null
      stripeId: string | null
      createdAt: string
      user: { id: string; name: string; email: string }
      coupon: { code: string } | null
    }>
  >([])

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<
    Array<{
      id: string
      plan: string
      startDate: string
      endDate: string
      active: boolean
      createdAt: string
      user: { id: string; name: string; email: string }
    }>
  >([])
  const [subscriptionBusy, setSubscriptionBusy] = useState<string | null>(null)

  // Certificates
  const [certificates, setCertificates] = useState<
    Array<{
      id: string
      certificateNumber: string
      issuedAt: string
      pdfUrl: string
      qrCode: string
      user: { id: string; name: string; email: string }
      course: { id: string; title: string }
    }>
  >([])
  const [certificateBusy, setCertificateBusy] = useState<string | null>(null)
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

  // Subcategories
  const [subCatParentId, setSubCatParentId] = useState('')
  const [subCatName, setSubCatName] = useState('')
  const [subCatBusy, setSubCatBusy] = useState(false)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null)
  const [editingSubcategoryName, setEditingSubcategoryName] = useState('')

  // Courses
  const [courses, setCourses] = useState<any[]>([])
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
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

  const subcategoriesForCourseCategory = useMemo(() => {
    const cat = categories.find((c) => c.id === courseForm.categoryId)
    return cat?.subcategories ?? []
  }, [categories, courseForm.categoryId])

  const allSubcategories = useMemo(() => {
    return categories.flatMap((c) =>
      (c.subcategories ?? []).map((s) => ({ ...s, categoryName: c.name }))
    )
  }, [categories])

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

  async function fetchUsers() {
    const res = await fetch('/api/admin/users')
    if (!res.ok) throw new Error('Failed to load users')
    const data = await res.json()
    setUsers(data.users || [])
  }

  async function fetchPayments() {
    const res = await fetch('/api/admin/payments')
    if (!res.ok) throw new Error('Failed to load payments')
    const data = await res.json()
    setPayments(data.payments || [])
  }

  async function fetchSubscriptions() {
    const res = await fetch('/api/admin/subscriptions')
    if (!res.ok) throw new Error('Failed to load subscriptions')
    const data = await res.json()
    setSubscriptions(data.subscriptions || [])
  }

  async function fetchCertificates() {
    const res = await fetch('/api/admin/certificates')
    if (!res.ok) throw new Error('Failed to load certificates')
    const data = await res.json()
    setCertificates(data.certificates || [])
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

  async function updateUserRole(id: string, role: string) {
    setUserBusy(id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      })
      if (!res.ok) throw new Error('Failed to update user')
      await fetchUsers()
      displayToast({ type: 'success', message: t('admin.userUpdated') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedUpdateUser'),
      })
    } finally {
      setUserBusy(null)
    }
  }

  async function deleteUser(id: string) {
    if (!window.confirm(t('admin.confirmDeleteUser'))) return

    setUserBusy(id)
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete user')
      await fetchUsers()
      displayToast({ type: 'success', message: t('admin.userDeleted') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedDeleteUser'),
      })
    } finally {
      setUserBusy(null)
    }
  }

  async function toggleSubscriptionActive(id: string, active: boolean) {
    setSubscriptionBusy(id)
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      })
      if (!res.ok) throw new Error('Failed to update subscription')
      await fetchSubscriptions()
      displayToast({
        type: 'success',
        message: active ? t('admin.subscriptionActivated') : t('admin.subscriptionDeactivated'),
      })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedUpdateSubscription'),
      })
    } finally {
      setSubscriptionBusy(null)
    }
  }

  async function deleteCertificate(id: string) {
    if (!window.confirm(t('admin.confirmDeleteCertificate'))) return

    setCertificateBusy(id)
    try {
      const res = await fetch(`/api/admin/certificates?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete certificate')
      await fetchCertificates()
      displayToast({ type: 'success', message: t('admin.userDeleted') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedDeleteCertificate'),
      })
    } finally {
      setCertificateBusy(null)
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

  useEffect(() => {
    if (tab === 'users') {
      fetchUsers().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadUsers') }))
    } else if (tab === 'payments') {
      fetchPayments().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadPayments') }))
    } else if (tab === 'subscriptions') {
      fetchSubscriptions().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadSubscriptions') }))
    } else if (tab === 'certificates') {
      fetchCertificates().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadCertificates') }))
    }
  }, [tab])

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

  async function createSubcategory() {
    if (!subCatName.trim()) {
      displayToast({ type: 'error', message: t('admin.subcategoryNameRequired') })
      return
    }
    if (!subCatParentId) {
      displayToast({ type: 'error', message: t('admin.categoryRequired') })
      return
    }

    setSubCatBusy(true)
    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subCatName.trim(), categoryId: subCatParentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || t('admin.failedCreateSubcategory'))

      setSubCatName('')
      await fetchCategories()
      displayToast({ type: 'success', message: t('admin.subcategoryCreated') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedCreateSubcategory'),
      })
    } finally {
      setSubCatBusy(false)
    }
  }

  async function updateSubcategory() {
    if (!editingSubcategoryId || !editingSubcategoryName.trim()) {
      displayToast({ type: 'error', message: t('admin.subcategoryNameRequired') })
      return
    }

    setSubCatBusy(true)
    try {
      const res = await fetch(`/api/admin/subcategories/${editingSubcategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingSubcategoryName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || t('admin.failedUpdateSubcategory'))

      setEditingSubcategoryId(null)
      setEditingSubcategoryName('')
      await fetchCategories()
      displayToast({ type: 'success', message: t('admin.subcategoryUpdated') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedUpdateSubcategory'),
      })
    } finally {
      setSubCatBusy(false)
    }
  }

  async function deleteSubcategory(subcategoryId: string) {
    if (!window.confirm(t('admin.confirmDeleteSubcategory'))) return

    setSubCatBusy(true)
    try {
      const res = await fetch(`/api/admin/subcategories/${subcategoryId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || t('admin.failedDeleteSubcategory'))

      if (courseForm.subcategoryId === subcategoryId) {
        setCourseForm((p) => ({ ...p, subcategoryId: '' }))
      }
      await fetchCategories()
      await fetchCourses()
      displayToast({ type: 'success', message: t('admin.subcategoryDeleted') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedDeleteSubcategory'),
      })
    } finally {
      setSubCatBusy(false)
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
      subcategoryId: course.subcategoryId || course.subcategory?.id || '',
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
      subcategoryId: '',
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
        subcategoryId: courseForm.subcategoryId || null,
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

        <div className="flex gap-2 flex-wrap">
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
          <button
            onClick={() => setTab('users')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'users' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabUsers')}
          </button>
          <button
            onClick={() => setTab('payments')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'payments' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabPayments')}
          </button>
          <button
            onClick={() => setTab('subscriptions')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'subscriptions' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabSubscriptions')}
          </button>
          <button
            onClick={() => setTab('certificates')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'certificates' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            {t('admin.tabCertificates')}
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

      {tab === 'users' && (
        <div className={`${siteCardClass} p-6`}>
          <h2 className="text-xl font-semibold mb-4">{t('admin.allUsers')}</h2>
          {users.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noUsers')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userName')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userEmail')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userRole')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Enrollments</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Subscriptions</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Payments</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Certificates</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          disabled={userBusy === u.id}
                          className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="AFFILIATE">AFFILIATE</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">{u._count.enrollments}</td>
                      <td className="px-4 py-2">{u._count.subscriptions}</td>
                      <td className="px-4 py-2">{u._count.payments}</td>
                      <td className="px-4 py-2">{u._count.certificates}</td>
                      <td className="px-4 py-2">
                        <button
                          disabled={userBusy === u.id}
                          onClick={() => deleteUser(u.id)}
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {t('admin.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className={`${siteCardClass} p-6`}>
          <h2 className="text-xl font-semibold mb-4">{t('admin.allPayments')}</h2>
          {payments.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noPayments')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userName')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userEmail')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.paymentAmount')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.paymentStatus')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.paymentProvider')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.paymentDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{p.user.name}</td>
                      <td className="px-4 py-2">{p.user.email}</td>
                      <td className="px-4 py-2">
                        {formatMoney(Math.round(p.amount * 100), language)} {p.currency.toUpperCase()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            p.status === 'succeeded'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{p.provider}</td>
                      <td className="px-4 py-2">{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'subscriptions' && (
        <div className={`${siteCardClass} p-6`}>
          <h2 className="text-xl font-semibold mb-4">{t('admin.allSubscriptions')}</h2>
          {subscriptions.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noSubscriptions')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userName')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userEmail')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.subscriptionPlan')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.subscriptionActive')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.subscriptionStartDate')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.subscriptionEndDate')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{s.user.name}</td>
                      <td className="px-4 py-2">{s.user.email}</td>
                      <td className="px-4 py-2">{s.plan}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            s.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {s.active ? t('admin.subscriptionActive') : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(s.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{new Date(s.endDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <button
                          disabled={subscriptionBusy === s.id}
                          onClick={() => toggleSubscriptionActive(s.id, !s.active)}
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
                        >
                          {s.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'certificates' && (
        <div className={`${siteCardClass} p-6`}>
          <h2 className="text-xl font-semibold mb-4">{t('admin.allCertificates')}</h2>
          {certificates.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noCertificates')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userName')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.userEmail')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Course</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.certificateNumber')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.certificateIssued')}</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {certificates.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{c.user.name}</td>
                      <td className="px-4 py-2">{c.user.email}</td>
                      <td className="px-4 py-2">{c.course.title}</td>
                      <td className="px-4 py-2">{c.certificateNumber}</td>
                      <td className="px-4 py-2">{new Date(c.issuedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <a
                          href={c.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-2 rounded border px-2 py-1 text-xs hover:bg-gray-100"
                        >
                          View PDF
                        </a>
                        <button
                          disabled={certificateBusy === c.id}
                          onClick={() => deleteCertificate(c.id)}
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {t('admin.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">{t('admin.allSubcategories')}</h2>
            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Field label={t('admin.parentCategory')}>
                  <select
                    value={subCatParentId}
                    onChange={(e) => setSubCatParentId(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                  >
                    <option value="">{t('admin.selectParentCategory')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('admin.name')}>
                  <input
                    value={subCatName}
                    onChange={(e) => setSubCatName(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                    placeholder={t('admin.namePlaceholder')}
                  />
                </Field>
                <button
                  type="button"
                  disabled={subCatBusy}
                  onClick={createSubcategory}
                  className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {subCatBusy ? t('admin.working') : t('admin.createSubcategory')}
                </button>
              </div>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {allSubcategories.length === 0 ? (
                <p className="text-gray-600">{t('admin.noSubcategories')}</p>
              ) : (
                allSubcategories.map((s) => (
                  <div key={s.id} className="flex flex-col gap-2 rounded border p-3 sm:flex-row sm:items-center sm:justify-between">
                    {editingSubcategoryId === s.id ? (
                      <>
                        <input
                          value={editingSubcategoryName}
                          onChange={(e) => setEditingSubcategoryName(e.target.value)}
                          className="w-full rounded border px-3 py-2"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={subCatBusy}
                            onClick={updateSubcategory}
                            className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {t('admin.save')}
                          </button>
                          <button
                            type="button"
                            disabled={subCatBusy}
                            onClick={() => {
                              setEditingSubcategoryId(null)
                              setEditingSubcategoryName('')
                            }}
                            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            {t('admin.cancel')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">
                            {s.categoryName}
                            {typeof s._count?.courses === 'number' ? ` · ${s._count.courses} courses` : ''}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={subCatBusy}
                            onClick={() => {
                              setEditingSubcategoryId(s.id)
                              setEditingSubcategoryName(s.name)
                            }}
                            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            {t('admin.edit')}
                          </button>
                          <button
                            type="button"
                            disabled={subCatBusy}
                            onClick={() => deleteSubcategory(s.id)}
                            className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                          >
                            {t('admin.delete')}
                          </button>
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
                    onChange={(e) =>
                      setCourseForm((p) => ({
                        ...p,
                        categoryId: e.target.value,
                        subcategoryId: '',
                      }))
                    }
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

                <Field label={t('admin.subcategory')}>
                  <select
                    value={courseForm.subcategoryId}
                    onChange={(e) => setCourseForm((p) => ({ ...p, subcategoryId: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                    disabled={!courseForm.categoryId}
                  >
                    <option value="">{t('admin.subcategoryNone')}</option>
                    {subcategoriesForCourseCategory.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
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
                          {c.category?.name}
                          {c.subcategory?.name ? ` / ${c.subcategory.name}` : ''} • {c.workloadHours}h
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

