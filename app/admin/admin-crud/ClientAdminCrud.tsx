'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import LoadingImage from '../../../components/LoadingImage'
import AdminMarketing from '../../../components/AdminMarketing'
import AdminTabs from '../../../components/admin/AdminTabs'
import AdminSearchBar from '../../../components/admin/AdminSearchBar'
import AdminQuizEditor from '../../../components/admin/AdminQuizEditor'
import {
  AdminDesktopTable,
  AdminMobileActions,
  AdminMobileCard,
  AdminMobileField,
  AdminMobileHeader,
  AdminMobileList,
  AdminMobileStat,
  AdminMobileStatGrid,
  adminActionBtnClass,
  adminDangerBtnClass,
} from '../../../components/admin/AdminListLayout'
import {
  adminCardClass,
  adminHeroClass,
  adminInputClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
  adminReportCardClass,
  adminSectionHeaderClass,
  adminSectionTitleClass,
  adminShellClass,
  adminStatCardClass,
  type AdminTab,
} from '../../../components/admin/adminStyles'
import { useI18n } from '../../../components/LanguageProvider'
import { formatMoney } from '../../../lib/i18n/format'
import { matchesAdminSearch } from '../../../lib/admin/matchesSearch'
import { canDeleteUser, canAssignRole } from '../../../lib/auth/rbac'

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
  videoUrl: string | null
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
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export default function ClientAdminCrud() {
  const { t, language } = useI18n()
  const { data: session } = useSession()
  const actorRole = session?.user?.role

  const adminTabs = useMemo(
    () => [
      { id: 'categories' as const, label: t('admin.tabCategories') },
      { id: 'courses' as const, label: t('admin.tabCourses') },
      { id: 'marketing' as const, label: t('admin.tabMarketing') },
      { id: 'affiliates' as const, label: t('admin.tabAffiliates') },
      { id: 'users' as const, label: t('admin.tabUsers') },
      { id: 'payments' as const, label: t('admin.tabPayments') },
      { id: 'subscriptions' as const, label: t('admin.tabSubscriptions') },
      { id: 'certificates' as const, label: t('admin.tabCertificates') },
      { id: 'quizzes' as const, label: t('admin.tabQuizzes') },
      { id: 'reports' as const, label: t('admin.tabReports') },
    ],
    [t]
  )

  const [tab, setTab] = useState<AdminTab>('categories')
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
  const [assignableRoles, setAssignableRoles] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [usersTotal, setUsersTotal] = useState(0)

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

  // Quizzes
  const [quizzes, setQuizzes] = useState<
    Array<{
      id: string
      courseId: string
      courseTitle: string
      categoryName: string
      questionCount: number
      attemptCount: number
      createdAt: string
      valid: boolean
    }>
  >([])
  const [coursesWithoutQuiz, setCoursesWithoutQuiz] = useState<
    Array<{ id: string; title: string; category: { name: string } }>
  >([])
  const [quizCourseId, setQuizCourseId] = useState('')
  const [quizBusy, setQuizBusy] = useState<string | null>(null)
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [editingQuizCourseTitle, setEditingQuizCourseTitle] = useState('')
  const [paymentSearch, setPaymentSearch] = useState('')
  const [subscriptionSearch, setSubscriptionSearch] = useState('')
  const [certificateSearch, setCertificateSearch] = useState('')
  const [quizSearch, setQuizSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [affiliateSearch, setAffiliateSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [subcategorySearch, setSubcategorySearch] = useState('')

  const [toast, setToast] = useState<Toast>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
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
  const [categoryUploadBusy, setCategoryUploadBusy] = useState<'create-icon' | 'edit-icon' | 'create-image' | 'edit-image' | null>(null)

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
    videoUrl: '',
    thumbnailUrl: '',
    syllabus: '',
    workloadHours: 100,
    seoTitle: '',
    seoDescription: '',
  })
  const [courseBusy, setCourseBusy] = useState(false)
  const [uploadBusy, setUploadBusy] = useState<'pdf' | 'thumbnail' | 'video' | null>(null)
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

  const filteredPayments = useMemo(() => {
    if (!paymentSearch.trim()) return payments
    return payments.filter((p) =>
      matchesAdminSearch(
        paymentSearch,
        p.user.name,
        p.user.email,
        p.status,
        p.provider,
        p.currency,
        p.coupon?.code
      )
    )
  }, [payments, paymentSearch])

  const filteredSubscriptions = useMemo(() => {
    if (!subscriptionSearch.trim()) return subscriptions
    return subscriptions.filter((s) =>
      matchesAdminSearch(subscriptionSearch, s.user.name, s.user.email, s.plan, s.active ? 'active' : 'inactive')
    )
  }, [subscriptions, subscriptionSearch])

  const filteredCertificates = useMemo(() => {
    if (!certificateSearch.trim()) return certificates
    return certificates.filter((c) =>
      matchesAdminSearch(
        certificateSearch,
        c.user.name,
        c.user.email,
        c.course.title,
        c.certificateNumber
      )
    )
  }, [certificates, certificateSearch])

  const filteredQuizzes = useMemo(() => {
    if (!quizSearch.trim()) return quizzes
    return quizzes.filter((q) =>
      matchesAdminSearch(quizSearch, q.courseTitle, q.categoryName, q.valid ? 'ok' : 'invalid')
    )
  }, [quizzes, quizSearch])

  const filteredCoursesWithoutQuiz = useMemo(() => {
    if (!quizSearch.trim()) return coursesWithoutQuiz
    return coursesWithoutQuiz.filter((c) =>
      matchesAdminSearch(quizSearch, c.title, c.category.name)
    )
  }, [coursesWithoutQuiz, quizSearch])

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courses
    return courses.filter((c) =>
      matchesAdminSearch(
        courseSearch,
        c.title,
        c.description,
        c.category?.name,
        c.subcategory?.name,
        c.pdfUrl
      )
    )
  }, [courses, courseSearch])

  const filteredCommissions = useMemo(() => {
    if (!affiliateSearch.trim()) return commissions
    return commissions.filter((c) =>
      matchesAdminSearch(
        affiliateSearch,
        c.affiliate.user.name,
        c.affiliate.user.email,
        c.referredUser.name,
        c.referredUser.email,
        c.status
      )
    )
  }, [commissions, affiliateSearch])

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories
    return categories.filter((c) => matchesAdminSearch(categorySearch, c.name, c.icon))
  }, [categories, categorySearch])

  const filteredSubcategories = useMemo(() => {
    if (!subcategorySearch.trim()) return allSubcategories
    return allSubcategories.filter((s) =>
      matchesAdminSearch(subcategorySearch, s.name, s.categoryName)
    )
  }, [allSubcategories, subcategorySearch])

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

  async function fetchUsers(page = userPage, search = userSearch) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '25',
      ...(search.trim() ? { search: search.trim() } : {}),
    })
    const res = await fetch(`/api/admin/users?${params}`)
    if (!res.ok) throw new Error('Failed to load users')
    const data = await res.json()
    setUsers(data.users || [])
    setUserPage(data.page || page)
    setUsersTotal(data.total || 0)
    setAssignableRoles(data.assignableRoles || [])
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

  async function fetchQuizzes() {
    const res = await fetch('/api/admin/quizzes')
    if (!res.ok) throw new Error('Failed to load quizzes')
    const data = await res.json()
    setQuizzes(data.quizzes || [])
    setCoursesWithoutQuiz(data.coursesWithoutQuiz || [])
  }

  async function createQuiz() {
    if (!quizCourseId) {
      displayToast({ type: 'error', message: t('admin.selectCourse') })
      return
    }
    const createdCourseTitle =
      filteredCoursesWithoutQuiz.find((c) => c.id === quizCourseId)?.title ?? ''
    setQuizBusy('create')
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: quizCourseId }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Failed to create quiz')
      setQuizCourseId('')
      await fetchQuizzes()
      if (data?.quiz?.id) {
        setEditingQuizId(data.quiz.id)
        setEditingQuizCourseTitle(createdCourseTitle)
      }
      displayToast({ type: 'success', message: t('admin.quizCreated') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedCreateQuiz'),
      })
    } finally {
      setQuizBusy(null)
    }
  }

  function openQuizEditor(quiz: { id: string; courseTitle: string }) {
    setEditingQuizId(quiz.id)
    setEditingQuizCourseTitle(quiz.courseTitle)
  }

  function closeQuizEditor() {
    setEditingQuizId(null)
    setEditingQuizCourseTitle('')
  }

  async function resetQuizDefault(id: string) {
    setQuizBusy(id)
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useDefault: true }),
      })
      if (!res.ok) throw new Error('Failed to update quiz')
      await fetchQuizzes()
      displayToast({ type: 'success', message: t('admin.quizUpdated') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedUpdateQuiz'),
      })
    } finally {
      setQuizBusy(null)
    }
  }

  async function deleteQuiz(id: string) {
    if (!window.confirm(t('admin.confirmDeleteQuiz'))) return
    setQuizBusy(id)
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete quiz')
      if (editingQuizId === id) closeQuizEditor()
      await fetchQuizzes()
      displayToast({ type: 'success', message: t('admin.quizDeleted') })
    } catch (e: unknown) {
      displayToast({
        type: 'error',
        message: e instanceof Error ? e.message : t('admin.failedDeleteQuiz'),
      })
    } finally {
      setQuizBusy(null)
    }
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
    Promise.all([
      fetchCategories().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadCategories') })),
      fetchCourses().catch(() => displayToast({ type: 'error', message: t('admin.failedLoadCourses') })),
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then((d) => {
          if (d && typeof d.totalUsers === 'number') setStats(d)
        })
        .catch(() => {}),
    ]).finally(() => setInitialLoading(false))
  }, [])

  useEffect(() => {
    if (initialLoading) return

    const loadTab = async () => {
      setTabLoading(true)
      try {
        if (tab === 'users') {
          await fetchUsers()
        } else if (tab === 'payments') {
          await fetchPayments()
        } else if (tab === 'subscriptions') {
          await fetchSubscriptions()
        } else if (tab === 'certificates') {
          await fetchCertificates()
        } else if (tab === 'quizzes') {
          await fetchQuizzes()
        } else if (tab === 'affiliates') {
          await fetchCommissions()
        } else if (tab === 'reports') {
          const d = await fetch('/api/admin/stats')
            .then((r) => r.json())
            .catch(() => null)
          if (d && typeof d.totalUsers === 'number') setStats(d)
        }
      } catch {
        if (tab === 'users') displayToast({ type: 'error', message: t('admin.failedLoadUsers') })
        else if (tab === 'payments') displayToast({ type: 'error', message: t('admin.failedLoadPayments') })
        else if (tab === 'subscriptions') displayToast({ type: 'error', message: t('admin.failedLoadSubscriptions') })
        else if (tab === 'certificates') displayToast({ type: 'error', message: t('admin.failedLoadCertificates') })
        else if (tab === 'quizzes') displayToast({ type: 'error', message: t('admin.failedLoadQuizzes') })
        else if (tab === 'affiliates') displayToast({ type: 'error', message: t('admin.noCommissions') })
        else if (tab === 'reports') displayToast({ type: 'error', message: t('admin.failedLoadUsers') })
      } finally {
        setTabLoading(false)
      }
    }

    if (
      tab === 'users' ||
      tab === 'payments' ||
      tab === 'subscriptions' ||
      tab === 'certificates' ||
      tab === 'quizzes' ||
      tab === 'affiliates' ||
      tab === 'reports'
    ) {
      void loadTab()
    } else {
      setTabLoading(false)
    }
  }, [tab, initialLoading])

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

  async function uploadCategoryMedia(
    file: File | null | undefined,
    target: 'create' | 'edit',
    field: 'icon' | 'image'
  ) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      displayToast({ type: 'error', message: 'Invalid image file type' })
      return
    }

    setCategoryUploadBusy(`${target}-${field}`)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'thumbnails')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Upload failed')

      const uploadedUrl = data.url || data.key
      if (target === 'create' && field === 'image') {
        setCatImageUrl(uploadedUrl)
      } else if (target === 'edit' && field === 'image') {
        setEditingCategoryImageUrl(uploadedUrl)
      } else if (target === 'create') {
        setCatIcon(uploadedUrl)
      } else {
        setEditingCategoryIcon(uploadedUrl)
      }
      displayToast({ type: 'success', message: 'Upload completed' })
    } catch (e: unknown) {
      displayToast({ type: 'error', message: e instanceof Error ? e.message : 'Upload failed' })
    } finally {
      setCategoryUploadBusy(null)
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
      videoUrl: course.videoUrl || '',
      thumbnailUrl: course.thumbnailUrl || '',
      syllabus: course.syllabus || '',
      workloadHours: course.workloadHours ?? 100,
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
      videoUrl: '',
      thumbnailUrl: '',
      syllabus: '',
      workloadHours: 100,
      seoTitle: '',
      seoDescription: '',
    })
  }

  async function submitCourse() {
    if (!courseForm.title.trim()) return displayToast({ type: 'error', message: t('admin.titleRequired') })
    if (!courseForm.description.trim()) return displayToast({ type: 'error', message: t('admin.descriptionRequired') })
    if (!courseForm.categoryId) return displayToast({ type: 'error', message: t('admin.categoryRequired') })
    if (!courseForm.pdfUrl.trim()) return displayToast({ type: 'error', message: t('admin.pdfUrlRequired') })
    if (!Number.isInteger(Number(courseForm.workloadHours)) || Number(courseForm.workloadHours) <= 0) {
      return displayToast({ type: 'error', message: 'Workload hours must be a positive integer' })
    }

    setCourseBusy(true)
    try {
      const payload = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        categoryId: courseForm.categoryId,
        subcategoryId: courseForm.subcategoryId || null,
        pdfUrl: courseForm.pdfUrl.trim(),
        videoUrl: courseForm.videoUrl.trim() ? courseForm.videoUrl.trim() : null,
        thumbnailUrl: courseForm.thumbnailUrl.trim() ? courseForm.thumbnailUrl.trim() : null,
        syllabus: courseForm.syllabus.trim() ? courseForm.syllabus.trim() : null,
        workloadHours: Number(courseForm.workloadHours),
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

  async function uploadCourseFile(kind: 'pdf' | 'thumbnail' | 'video', file: File | null | undefined) {
    if (!file) return

    const expected =
      kind === 'pdf'
        ? file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        : kind === 'thumbnail'
          ? file.type.startsWith('image/')
          : file.type.startsWith('video/')

    if (!expected) {
      displayToast({ type: 'error', message: `Invalid ${kind} file type` })
      return
    }

    setUploadBusy(kind)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', kind === 'pdf' ? 'pdfs' : kind === 'thumbnail' ? 'thumbnails' : 'videos')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Upload failed')

      const uploadedUrl = data.url || data.key
      setCourseForm((p) => ({
        ...p,
        ...(kind === 'pdf' ? { pdfUrl: uploadedUrl } : {}),
        ...(kind === 'thumbnail' ? { thumbnailUrl: uploadedUrl } : {}),
        ...(kind === 'video' ? { videoUrl: uploadedUrl } : {}),
      }))
      displayToast({ type: 'success', message: 'Upload completed' })
    } catch (e: unknown) {
      displayToast({ type: 'error', message: e instanceof Error ? e.message : 'Upload failed' })
    } finally {
      setUploadBusy(null)
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

  if (initialLoading) {
    return (
      <div className={adminShellClass}>
        <LoadingImage size="lg" label={t('common.loading')} className="py-24" />
      </div>
    )
  }

  return (
    <div className={adminShellClass}>
      {toast && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm shadow-sm ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className={adminHeroClass}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-teal-200 sm:text-xs">{t('common.admin')}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{t('admin.panel')}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">{t('admin.panelSubtitle')}</p>
          </div>
          <a
            href="/api/admin/leads"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 sm:w-auto"
          >
            {t('admin.exportLeads')}
          </a>
        </div>
      </div>

      {stats && (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-3 lg:grid-cols-4">
          <div className={adminStatCardClass}>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.users')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{stats.totalUsers}</p>
          </div>
          <div className={adminStatCardClass}>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.revenue')}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 sm:text-2xl">
              {formatMoney(stats.revenueUsd, language)}
            </p>
          </div>
          <div className={adminStatCardClass}>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.activeSubscriptions')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{stats.activeSubscriptions}</p>
          </div>
          <div className={adminStatCardClass}>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.completionRate')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{stats.completionRatePercent}%</p>
          </div>
          <div className={`${adminStatCardClass} col-span-2 border-t-teal-600 lg:col-span-1`}>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.enrollments')}</p>
            <p className="mt-1 text-xs leading-snug text-slate-700 sm:text-sm">
              {t('admin.enrollmentsSummary', {
                completed: stats.completedEnrollments,
                total: stats.totalEnrollments,
                completedLabel: t('admin.completed'),
              })}
            </p>
          </div>
          <div className={adminStatCardClass}>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.affiliateReferrals')}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{stats.affiliateReferrals}</p>
          </div>
          <div className={`${adminStatCardClass} col-span-2 border-t-emerald-600 lg:col-span-1`}>
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.pendingCommissions')}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 sm:text-2xl">
              {formatMoney(Math.round(stats.pendingCommissionUsd * 100), language)}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <AdminTabs tabs={adminTabs} value={tab} onChange={setTab} mobileLabel={t('admin.panel')} />
      </div>

      {tabLoading ? (
        <LoadingImage size="lg" label={t('common.loading')} className="py-16" />
      ) : (
        <>
      {tab === 'marketing' && <AdminMarketing />}

      {tab === 'affiliates' && (
        <div className={adminCardClass}>
          <div className={adminSectionHeaderClass}>
            <h2 className={adminSectionTitleClass}>{t('admin.tabAffiliates')}</h2>
            {commissions.length > 0 ? (
              <AdminSearchBar
                value={affiliateSearch}
                onChange={setAffiliateSearch}
                placeholder={t('admin.searchAffiliates')}
                className="w-full sm:max-w-sm"
              />
            ) : null}
          </div>
          {commissions.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noCommissions')}</p>
          ) : filteredCommissions.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
          ) : (
            <>
              <AdminMobileList>
                {filteredCommissions.map((c) => (
                  <AdminMobileCard key={c.id}>
                    <AdminMobileHeader
                      title={`${c.affiliate.user.name} → ${c.referredUser.name}`}
                      subtitle={c.referredUser.email}
                    />
                    <AdminMobileField label={t('admin.revenue')}>
                      {formatMoney(Math.round(c.amount * 100), language)}
                    </AdminMobileField>
                    <AdminMobileField label="Status">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </AdminMobileField>
                    <AdminMobileField label={t('admin.paymentDate')}>
                      {new Date(c.createdAt).toLocaleString()}
                    </AdminMobileField>
                    {c.status === 'PENDING' ? (
                      <AdminMobileActions>
                        <button
                          type="button"
                          disabled={commissionBusy === c.id}
                          onClick={() => approveCommission(c.id)}
                          className={`${adminPrimaryBtnClass} w-full bg-emerald-600 hover:bg-emerald-700`}
                        >
                          {t('admin.approveCommission')}
                        </button>
                      </AdminMobileActions>
                    ) : null}
                  </AdminMobileCard>
                ))}
              </AdminMobileList>
              <ul className="hidden divide-y divide-slate-100 text-sm md:block">
                {filteredCommissions.map((c) => (
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
            </>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className={adminCardClass}>
          <div className={adminSectionHeaderClass}>
            <div>
              <h2 className={adminSectionTitleClass}>{t('admin.allUsers')}</h2>
              <p className={`${siteMutedClass} mt-1 text-sm`}>
                {usersTotal} total
              </p>
            </div>
            <div className="w-full sm:max-w-md">
              <AdminSearchBar
                value={userSearch}
                onChange={setUserSearch}
                placeholder={t('admin.searchUsers')}
                submitLabel={t('admin.search')}
                onSubmit={() => void fetchUsers(1, userSearch)}
              />
            </div>
          </div>
          {users.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noUsers')}</p>
          ) : (
            <>
              <AdminMobileList>
                {users.map((u) => (
                  <AdminMobileCard key={u.id}>
                    <AdminMobileHeader title={u.name} subtitle={u.email} />
                    <AdminMobileField label={t('admin.userRole')}>
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        disabled={
                          userBusy === u.id ||
                          !assignableRoles.some((r) => canAssignRole(actorRole, u.role, r))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm disabled:opacity-50"
                      >
                        {Array.from(new Set([u.role, ...assignableRoles])).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </AdminMobileField>
                    <AdminMobileStatGrid>
                      <AdminMobileStat label="Enroll." value={u._count.enrollments} />
                      <AdminMobileStat label="Subs." value={u._count.subscriptions} />
                      <AdminMobileStat label="Pay." value={u._count.payments} />
                      <AdminMobileStat label="Cert." value={u._count.certificates} />
                    </AdminMobileStatGrid>
                    <AdminMobileActions>
                      <button
                        disabled={userBusy === u.id || !canDeleteUser(actorRole, u.role)}
                        onClick={() => deleteUser(u.id)}
                        className={adminDangerBtnClass}
                      >
                        {t('admin.delete')}
                      </button>
                    </AdminMobileActions>
                  </AdminMobileCard>
                ))}
              </AdminMobileList>

              <AdminDesktopTable>
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
                          disabled={
                            userBusy === u.id ||
                            !assignableRoles.some((r) => canAssignRole(actorRole, u.role, r))
                          }
                          className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                        >
                          {Array.from(new Set([u.role, ...assignableRoles])).map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">{u._count.enrollments}</td>
                      <td className="px-4 py-2">{u._count.subscriptions}</td>
                      <td className="px-4 py-2">{u._count.payments}</td>
                      <td className="px-4 py-2">{u._count.certificates}</td>
                      <td className="px-4 py-2">
                        <button
                          disabled={userBusy === u.id || !canDeleteUser(actorRole, u.role)}
                          onClick={() => deleteUser(u.id)}
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {t('admin.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminDesktopTable>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={userPage <= 1}
                  onClick={() => fetchUsers(userPage - 1, userSearch)}
                  className={`${adminSecondaryBtnClass} w-full sm:w-auto`}
                >
                  Previous
                </button>
                <span className="text-center text-sm text-slate-600">
                  Page {userPage} of {Math.max(1, Math.ceil(usersTotal / 25))}
                </span>
                <button
                  type="button"
                  disabled={userPage >= Math.ceil(usersTotal / 25)}
                  onClick={() => fetchUsers(userPage + 1, userSearch)}
                  className={`${adminSecondaryBtnClass} w-full sm:w-auto`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className={adminCardClass}>
          <div className={adminSectionHeaderClass}>
            <h2 className={adminSectionTitleClass}>{t('admin.allPayments')}</h2>
            {payments.length > 0 ? (
              <AdminSearchBar
                value={paymentSearch}
                onChange={setPaymentSearch}
                placeholder={t('admin.searchPayments')}
                className="w-full sm:max-w-sm"
              />
            ) : null}
          </div>
          {payments.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noPayments')}</p>
          ) : filteredPayments.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
          ) : (
            <>
              <AdminMobileList>
                {filteredPayments.map((p) => (
                  <AdminMobileCard key={p.id}>
                    <AdminMobileHeader title={p.user.name} subtitle={p.user.email} />
                    <div className="space-y-2">
                      <AdminMobileField label={t('admin.paymentAmount')}>
                        {formatMoney(Math.round(p.amount * 100), language)} {p.currency.toUpperCase()}
                      </AdminMobileField>
                      <AdminMobileField label={t('admin.paymentStatus')}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            p.status === 'succeeded'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </AdminMobileField>
                      <AdminMobileField label={t('admin.paymentProvider')}>{p.provider}</AdminMobileField>
                      <AdminMobileField label={t('admin.paymentDate')}>
                        {new Date(p.createdAt).toLocaleString()}
                      </AdminMobileField>
                    </div>
                  </AdminMobileCard>
                ))}
              </AdminMobileList>

              <AdminDesktopTable>
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
                  {filteredPayments.map((p) => (
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
              </AdminDesktopTable>
            </>
          )}
        </div>
      )}

      {tab === 'subscriptions' && (
        <div className={adminCardClass}>
          <div className={adminSectionHeaderClass}>
            <h2 className={adminSectionTitleClass}>{t('admin.allSubscriptions')}</h2>
            {subscriptions.length > 0 ? (
              <AdminSearchBar
                value={subscriptionSearch}
                onChange={setSubscriptionSearch}
                placeholder={t('admin.searchSubscriptions')}
                className="w-full sm:max-w-sm"
              />
            ) : null}
          </div>
          {subscriptions.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noSubscriptions')}</p>
          ) : filteredSubscriptions.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
          ) : (
            <>
              <AdminMobileList>
                {filteredSubscriptions.map((s) => (
                  <AdminMobileCard key={s.id}>
                    <AdminMobileHeader title={s.user.name} subtitle={s.user.email} />
                    <div className="space-y-2">
                      <AdminMobileField label={t('admin.subscriptionPlan')}>{s.plan}</AdminMobileField>
                      <AdminMobileField label={t('admin.subscriptionActive')}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            s.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {s.active ? t('admin.subscriptionActive') : 'Inactive'}
                        </span>
                      </AdminMobileField>
                      <AdminMobileField label={t('admin.subscriptionStartDate')}>
                        {new Date(s.startDate).toLocaleDateString()}
                      </AdminMobileField>
                      <AdminMobileField label={t('admin.subscriptionEndDate')}>
                        {new Date(s.endDate).toLocaleDateString()}
                      </AdminMobileField>
                    </div>
                    <AdminMobileActions>
                      <button
                        disabled={subscriptionBusy === s.id}
                        onClick={() => toggleSubscriptionActive(s.id, !s.active)}
                        className={adminActionBtnClass}
                      >
                        {s.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </AdminMobileActions>
                  </AdminMobileCard>
                ))}
              </AdminMobileList>

              <AdminDesktopTable>
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
                  {filteredSubscriptions.map((s) => (
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
              </AdminDesktopTable>
            </>
          )}
        </div>
      )}

      {tab === 'certificates' && (
        <div className={adminCardClass}>
          <div className={adminSectionHeaderClass}>
            <h2 className={adminSectionTitleClass}>{t('admin.allCertificates')}</h2>
            {certificates.length > 0 ? (
              <AdminSearchBar
                value={certificateSearch}
                onChange={setCertificateSearch}
                placeholder={t('admin.searchCertificates')}
                className="w-full sm:max-w-sm"
              />
            ) : null}
          </div>
          {certificates.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noCertificates')}</p>
          ) : filteredCertificates.length === 0 ? (
            <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
          ) : (
            <>
              <AdminMobileList>
                {filteredCertificates.map((c) => (
                  <AdminMobileCard key={c.id}>
                    <AdminMobileHeader title={c.user.name} subtitle={c.user.email} />
                    <div className="space-y-2">
                      <AdminMobileField label="Course">{c.course.title}</AdminMobileField>
                      <AdminMobileField label={t('admin.certificateNumber')}>
                        <span className="font-mono text-xs">{c.certificateNumber}</span>
                      </AdminMobileField>
                      <AdminMobileField label={t('admin.certificateIssued')}>
                        {new Date(c.issuedAt).toLocaleDateString()}
                      </AdminMobileField>
                    </div>
                    <AdminMobileActions>
                      <a
                        href={c.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={adminActionBtnClass}
                      >
                        View PDF
                      </a>
                      <button
                        disabled={certificateBusy === c.id}
                        onClick={() => deleteCertificate(c.id)}
                        className={adminDangerBtnClass}
                      >
                        {t('admin.delete')}
                      </button>
                    </AdminMobileActions>
                  </AdminMobileCard>
                ))}
              </AdminMobileList>

              <AdminDesktopTable>
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
                  {filteredCertificates.map((c) => (
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
              </AdminDesktopTable>
            </>
          )}
        </div>
      )}

      {tab === 'quizzes' && (
        <div className="space-y-6">
          {(quizzes.length > 0 || coursesWithoutQuiz.length > 0) && (
            <AdminSearchBar
              value={quizSearch}
              onChange={setQuizSearch}
              placeholder={t('admin.searchQuizzes')}
              className="max-w-xl"
            />
          )}

          {editingQuizId ? (
            <AdminQuizEditor
              quizId={editingQuizId}
              courseTitle={editingQuizCourseTitle}
              onSaved={() => {
                void fetchQuizzes()
                displayToast({ type: 'success', message: t('admin.quizUpdated') })
              }}
              onCancel={closeQuizEditor}
            />
          ) : null}

          <div className={adminCardClass}>
            <h2 className="text-xl font-semibold mb-4">{t('admin.createQuiz')}</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label={t('admin.selectCourse')}>
                <select
                  value={quizCourseId}
                  onChange={(e) => setQuizCourseId(e.target.value)}
                  className={adminInputClass}
                >
                  <option value="">{t('admin.selectCourse')}</option>
                  {filteredCoursesWithoutQuiz.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category.name})
                    </option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                disabled={quizBusy === 'create' || !quizCourseId}
                onClick={createQuiz}
                className={`${adminPrimaryBtnClass} w-full sm:w-auto`}
              >
                {quizBusy === 'create' ? t('common.working') : t('admin.createQuiz')}
              </button>
            </div>
            {coursesWithoutQuiz.length === 0 ? (
              <p className={`${siteMutedClass} mt-3 text-sm`}>{t('admin.coursesWithoutQuiz')}: 0</p>
            ) : filteredCoursesWithoutQuiz.length === 0 ? (
              <p className={`${siteMutedClass} mt-3 text-sm`}>{t('admin.noSearchResults')}</p>
            ) : (
              <p className={`${siteMutedClass} mt-3 text-sm`}>
                {t('admin.coursesWithoutQuiz')}: {filteredCoursesWithoutQuiz.length}
                {quizSearch.trim() ? ` / ${coursesWithoutQuiz.length}` : ''}
              </p>
            )}
          </div>

          <div className={adminCardClass}>
            <h2 className="mb-4 text-xl font-semibold">{t('admin.allQuizzes')}</h2>
            {quizzes.length === 0 ? (
              <p className={siteMutedClass}>{t('admin.noQuizzes')}</p>
            ) : filteredQuizzes.length === 0 ? (
              <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
            ) : (
              <>
                <AdminMobileList>
                  {filteredQuizzes.map((q) => (
                    <AdminMobileCard key={q.id}>
                      <AdminMobileHeader title={q.courseTitle} subtitle={q.categoryName} />
                      <AdminMobileStatGrid>
                        <AdminMobileStat label={t('admin.quizQuestions')} value={q.questionCount} />
                        <AdminMobileStat label={t('admin.quizAttempts')} value={q.attemptCount} />
                      </AdminMobileStatGrid>
                      <div className="mt-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            q.valid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {q.valid ? 'OK' : t('admin.quizInvalid')}
                        </span>
                      </div>
                      <AdminMobileActions>
                        <button
                          type="button"
                          disabled={quizBusy === q.id}
                          onClick={() => openQuizEditor(q)}
                          className={adminPrimaryBtnClass}
                        >
                          {t('admin.editQuiz')}
                        </button>
                        <button
                          disabled={quizBusy === q.id}
                          onClick={() => resetQuizDefault(q.id)}
                          className={adminActionBtnClass}
                        >
                          {t('admin.quizResetDefault')}
                        </button>
                        <button
                          disabled={quizBusy === q.id}
                          onClick={() => deleteQuiz(q.id)}
                          className={adminDangerBtnClass}
                        >
                          {t('admin.delete')}
                        </button>
                      </AdminMobileActions>
                    </AdminMobileCard>
                  ))}
                </AdminMobileList>

                <AdminDesktopTable>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Course</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.quizQuestions')}</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">{t('admin.quizAttempts')}</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredQuizzes.map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{q.courseTitle}</td>
                        <td className="px-4 py-2">{q.categoryName}</td>
                        <td className="px-4 py-2">{q.questionCount}</td>
                        <td className="px-4 py-2">{q.attemptCount}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`rounded px-2 py-1 text-xs ${
                              q.valid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {q.valid ? 'OK' : t('admin.quizInvalid')}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            disabled={quizBusy === q.id}
                            onClick={() => openQuizEditor(q)}
                            className="mr-2 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {t('admin.editQuiz')}
                          </button>
                          <button
                            disabled={quizBusy === q.id}
                            onClick={() => resetQuizDefault(q.id)}
                            className="mr-2 rounded border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
                          >
                            {t('admin.quizResetDefault')}
                          </button>
                          <button
                            disabled={quizBusy === q.id}
                            onClick={() => deleteQuiz(q.id)}
                            className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            {t('admin.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminDesktopTable>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'reports' && stats && (
        <div className={adminCardClass}>
          <h2 className={`${adminSectionTitleClass} mb-4`}>{t('admin.tabReports')}</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
            <div className={adminReportCardClass}>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.tabUsers')}</p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:mt-2 sm:text-2xl">{stats.totalUsers}</p>
            </div>
            <div className={adminReportCardClass}>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.revenue')}</p>
              <p className="mt-1 text-lg font-bold tabular-nums sm:mt-2 sm:text-2xl">{formatMoney(stats.revenueUsd, language)}</p>
            </div>
            <div className={adminReportCardClass}>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.activeSubscriptions')}</p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:mt-2 sm:text-2xl">{stats.activeSubscriptions}</p>
            </div>
            <div className={adminReportCardClass}>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.completionRate')}</p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:mt-2 sm:text-2xl">{stats.completionRatePercent}%</p>
            </div>
            <div className={`${adminReportCardClass} col-span-2 lg:col-span-1`}>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.enrollments')}</p>
              <p className="mt-1 text-xs leading-snug text-slate-700 sm:mt-2 sm:text-sm">
                {t('admin.enrollmentsSummary', {
                  completed: stats.completedEnrollments,
                  total: stats.totalEnrollments,
                  completedLabel: t('admin.completed'),
                })}
              </p>
            </div>
            <div className={adminReportCardClass}>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.affiliateReferrals')}</p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:mt-2 sm:text-2xl">{stats.affiliateReferrals}</p>
            </div>
            <div className={`${adminReportCardClass} col-span-2 lg:col-span-3`}>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-blue-900 sm:text-xs">{t('admin.pendingCommissions')}</p>
              <p className="mt-1 text-lg font-bold tabular-nums sm:mt-2 sm:text-2xl">
                {formatMoney(Math.round(stats.pendingCommissionUsd * 100), language)}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <div className={adminCardClass}>
            <h2 className={`${adminSectionTitleClass} mb-4`}>{t('admin.createCategory')}</h2>

            <div className="space-y-3">
              <Field label={t('admin.name')}>
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className={adminInputClass}
                  placeholder={t('admin.namePlaceholder')}
                />
              </Field>
              <Field label={t('admin.iconOptional')}>
                <input
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className={adminInputClass}
                  placeholder="Upload an icon, paste a URL, emoji, or icon key"
                />
                <input
                  type="file"
                  accept="image/*"
                  disabled={categoryUploadBusy !== null}
                  onChange={(e) => uploadCategoryMedia(e.target.files?.[0], 'create', 'icon')}
                  className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {categoryUploadBusy === 'create-icon' ? <p className="mt-1 text-xs text-slate-500">Uploading icon...</p> : null}
              </Field>
              <Field label={t('admin.cardImageUrl')}>
                <input
                  value={catImageUrl}
                  onChange={(e) => setCatImageUrl(e.target.value)}
                  className={adminInputClass}
                  placeholder="Upload an image or paste a URL"
                />
                <input
                  type="file"
                  accept="image/*"
                  disabled={categoryUploadBusy !== null}
                  onChange={(e) => uploadCategoryMedia(e.target.files?.[0], 'create', 'image')}
                  className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {categoryUploadBusy === 'create-image' ? <p className="mt-1 text-xs text-slate-500">Uploading image...</p> : null}
              </Field>

              <button
                disabled={catBusy}
                onClick={createCategory}
                className={`${adminPrimaryBtnClass} w-full`}
              >
                {catBusy ? t('admin.working') : t('admin.create')}
              </button>
            </div>
          </div>

          <div className={adminCardClass}>
            <div className={adminSectionHeaderClass}>
              <h2 className={adminSectionTitleClass}>{t('admin.allCategories')}</h2>
              {categories.length > 0 ? (
                <AdminSearchBar
                  value={categorySearch}
                  onChange={setCategorySearch}
                  placeholder={t('admin.searchCategories')}
                  className="w-full sm:max-w-sm"
                />
              ) : null}
            </div>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className={siteMutedClass}>{t('admin.noCategories')}</p>
              ) : filteredCategories.length === 0 ? (
                <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
              ) : (
                filteredCategories.map((c) => (
                  <AdminMobileCard key={c.id}>
                    {editingCategoryId === c.id ? (
                      <>
                        <input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className={adminInputClass}
                          placeholder={t('admin.name')}
                        />
                        <input
                          value={editingCategoryIcon}
                          onChange={(e) => setEditingCategoryIcon(e.target.value)}
                          className={adminInputClass}
                          placeholder="Upload an icon, paste a URL, emoji, or icon key"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          disabled={categoryUploadBusy !== null}
                          onChange={(e) => uploadCategoryMedia(e.target.files?.[0], 'edit', 'icon')}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        {categoryUploadBusy === 'edit-icon' ? <p className="text-xs text-slate-500">Uploading icon...</p> : null}
                        <input
                          value={editingCategoryImageUrl}
                          onChange={(e) => setEditingCategoryImageUrl(e.target.value)}
                          className={adminInputClass}
                          placeholder={t('admin.cardImageUrl')}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          disabled={categoryUploadBusy !== null}
                          onChange={(e) => uploadCategoryMedia(e.target.files?.[0], 'edit', 'image')}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                        />
                        {categoryUploadBusy === 'edit-image' ? <p className="text-xs text-slate-500">Uploading image...</p> : null}
                        <AdminMobileActions>
                          <button
                            disabled={catBusy}
                            onClick={updateCategory}
                            className={`${adminPrimaryBtnClass} bg-emerald-600 hover:bg-emerald-700`}
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
                            className={adminSecondaryBtnClass}
                          >
                            {t('admin.cancel')}
                          </button>
                        </AdminMobileActions>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
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
                          <AdminMobileActions>
                            <button
                              disabled={catBusy}
                              onClick={() => {
                                setEditingCategoryId(c.id)
                                setEditingCategoryName(c.name)
                                setEditingCategoryIcon(c.icon ?? '')
                                setEditingCategoryImageUrl(c.imageUrl ?? '')
                              }}
                              className={adminActionBtnClass}
                            >
                              {t('admin.edit')}
                            </button>
                            <button
                              disabled={catBusy}
                              onClick={() => deleteCategory(c.id)}
                              className={adminDangerBtnClass}
                            >
                              {t('admin.delete')}
                            </button>
                          </AdminMobileActions>
                        </div>
                      </>
                    )}
                  </AdminMobileCard>
                ))
              )}
            </div>
          </div>

          <div className={`${adminCardClass} lg:col-span-2`}>
            <h2 className={`${adminSectionTitleClass} mb-4`}>{t('admin.allSubcategories')}</h2>
            <div className="mb-6 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Field label={t('admin.parentCategory')}>
                  <select
                    value={subCatParentId}
                    onChange={(e) => setSubCatParentId(e.target.value)}
                    className={adminInputClass}
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
                    className={adminInputClass}
                    placeholder={t('admin.namePlaceholder')}
                  />
                </Field>
                <button
                  type="button"
                  disabled={subCatBusy}
                  onClick={createSubcategory}
                  className={`${adminPrimaryBtnClass} w-full`}
                >
                  {subCatBusy ? t('admin.working') : t('admin.createSubcategory')}
                </button>
              </div>
            </div>

            {allSubcategories.length > 0 ? (
              <AdminSearchBar
                value={subcategorySearch}
                onChange={setSubcategorySearch}
                placeholder={t('admin.searchSubcategories')}
                className="mb-4 max-w-xl"
              />
            ) : null}

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {allSubcategories.length === 0 ? (
                <p className={siteMutedClass}>{t('admin.noSubcategories')}</p>
              ) : filteredSubcategories.length === 0 ? (
                <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
              ) : (
                filteredSubcategories.map((s) => (
                  <AdminMobileCard key={s.id}>
                    {editingSubcategoryId === s.id ? (
                      <>
                        <input
                          value={editingSubcategoryName}
                          onChange={(e) => setEditingSubcategoryName(e.target.value)}
                          className={adminInputClass}
                        />
                        <AdminMobileActions>
                          <button
                            type="button"
                            disabled={subCatBusy}
                            onClick={updateSubcategory}
                            className={`${adminPrimaryBtnClass} bg-emerald-600 hover:bg-emerald-700`}
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
                            className={adminSecondaryBtnClass}
                          >
                            {t('admin.cancel')}
                          </button>
                        </AdminMobileActions>
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
                        <AdminMobileActions>
                          <button
                            type="button"
                            disabled={subCatBusy}
                            onClick={() => {
                              setEditingSubcategoryId(s.id)
                              setEditingSubcategoryName(s.name)
                            }}
                            className={adminActionBtnClass}
                          >
                            {t('admin.edit')}
                          </button>
                          <button
                            type="button"
                            disabled={subCatBusy}
                            onClick={() => deleteSubcategory(s.id)}
                            className={adminDangerBtnClass}
                          >
                            {t('admin.delete')}
                          </button>
                        </AdminMobileActions>
                      </>
                    )}
                  </AdminMobileCard>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={adminCardClass}>
            <h2 className="mb-4 text-xl font-semibold">
              {editingCourseId ? t('admin.editCourse') : t('admin.createCourse')}
            </h2>

            <div className="space-y-4">
              <Field label={t('admin.title')}>
                <input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                  className={adminInputClass}
                />
              </Field>

              <Field label={t('admin.description')}>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                  className={adminInputClass}
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
                    className={adminInputClass}
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
                    className={adminInputClass}
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
                    min={1}
                    step={1}
                    value={courseForm.workloadHours}
                    onChange={(e) => setCourseForm((p) => ({ ...p, workloadHours: Number(e.target.value) }))}
                    className={adminInputClass}
                  />
                </Field>
              </div>

              <Field label={t('admin.pdfUrl')}>
                <input
                  value={courseForm.pdfUrl}
                  onChange={(e) => setCourseForm((p) => ({ ...p, pdfUrl: e.target.value }))}
                  className={adminInputClass}
                  placeholder="Upload a PDF or paste a URL"
                />
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={uploadBusy !== null}
                  onChange={(e) => uploadCourseFile('pdf', e.target.files?.[0])}
                  className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {uploadBusy === 'pdf' ? <p className="mt-1 text-xs text-slate-500">Uploading PDF...</p> : null}
              </Field>

              <Field label={t('admin.thumbnailOptional')}>
                <input
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                  className={adminInputClass}
                  placeholder="Upload an image or paste a URL"
                />
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadBusy !== null}
                  onChange={(e) => uploadCourseFile('thumbnail', e.target.files?.[0])}
                  className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {uploadBusy === 'thumbnail' ? <p className="mt-1 text-xs text-slate-500">Uploading image...</p> : null}
              </Field>

              <Field label="Video URL (optional)">
                <input
                  value={courseForm.videoUrl}
                  onChange={(e) => setCourseForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  className={adminInputClass}
                  placeholder="Upload a video or paste a URL"
                />
                <input
                  type="file"
                  accept="video/*"
                  disabled={uploadBusy !== null}
                  onChange={(e) => uploadCourseFile('video', e.target.files?.[0])}
                  className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {uploadBusy === 'video' ? <p className="mt-1 text-xs text-slate-500">Uploading video...</p> : null}
              </Field>

              <Field label={t('admin.syllabusOptional')}>
                <textarea
                  value={courseForm.syllabus}
                  onChange={(e) => setCourseForm((p) => ({ ...p, syllabus: e.target.value }))}
                  className={adminInputClass}
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t('admin.seoTitleOptional')}>
                  <input
                    value={courseForm.seoTitle}
                    onChange={(e) => setCourseForm((p) => ({ ...p, seoTitle: e.target.value }))}
                    className={adminInputClass}
                  />
                </Field>

                <Field label={t('admin.seoDescOptional')}>
                  <input
                    value={courseForm.seoDescription}
                    onChange={(e) => setCourseForm((p) => ({ ...p, seoDescription: e.target.value }))}
                    className={adminInputClass}
                  />
                </Field>
              </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  disabled={courseBusy}
                  onClick={submitCourse}
                  className={`${adminPrimaryBtnClass} flex-1`}
                >
                  {courseBusy ? t('admin.saving') : editingCourseId ? t('admin.update') : t('admin.create')}
                </button>
                <button
                  disabled={courseBusy}
                  onClick={resetCourseForm}
                  className={adminSecondaryBtnClass}
                >
                  {t('admin.reset')}
                </button>
              </div>

              <div className="text-xs text-gray-500">
                {t('admin.selectedCategory')} {selectedCategoryName || '—'}
              </div>
            </div>
          </div>

          <div className={adminCardClass}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-xl font-semibold">{t('admin.allCourses')}</h2>
              {courses.length > 0 ? (
                <AdminSearchBar
                  value={courseSearch}
                  onChange={setCourseSearch}
                  placeholder={t('admin.searchCourses')}
                  className="w-full sm:max-w-sm"
                />
              ) : null}
            </div>
            <div className="space-y-3">
              {courses.length === 0 ? (
                <p className={siteMutedClass}>{t('admin.noCourses')}</p>
              ) : filteredCourses.length === 0 ? (
                <p className={siteMutedClass}>{t('admin.noSearchResults')}</p>
              ) : (
                filteredCourses.map((c) => (
                  <AdminMobileCard key={c.id}>
                    <AdminMobileHeader
                      title={c.title}
                      subtitle={`${c.category?.name}${c.subcategory?.name ? ` / ${c.subcategory.name}` : ''} • ${c.workloadHours}h`}
                    />
                    <p className="mt-2 break-all text-xs text-slate-500">{c.pdfUrl}</p>
                    <AdminMobileActions>
                      <button
                        disabled={courseBusy}
                        onClick={() => beginEditCourse(c)}
                        className={adminActionBtnClass}
                      >
                        {t('admin.edit')}
                      </button>
                      <button
                        disabled={courseBusy}
                        onClick={() => deleteCourse(c.id)}
                        className={adminDangerBtnClass}
                      >
                        {t('admin.delete')}
                      </button>
                    </AdminMobileActions>
                  </AdminMobileCard>
                ))
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

