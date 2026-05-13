'use client'

import { useEffect, useMemo, useState } from 'react'
import { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'

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
  const [tab, setTab] = useState<'categories' | 'courses'>('categories')
  const [toast, setToast] = useState<Toast>(null)

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

  const showToast = (t: Toast) => {
    setToast(t)
    if (t) {
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

  useEffect(() => {
    fetchCategories().catch(() => showToast({ type: 'error', message: 'Could not load categories' }))
    fetchCourses().catch(() => showToast({ type: 'error', message: 'Could not load courses' }))
  }, [])

  async function createCategory() {
    if (!catName.trim()) {
      showToast({ type: 'error', message: 'Category name is required' })
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
      if (!res.ok) throw new Error(data?.error || 'Failed to create category')

      setCatName('')
      setCatIcon('')
      setCatImageUrl('')
      await fetchCategories()
      showToast({ type: 'success', message: 'Category created' })
    } catch (e: any) {
      showToast({ type: 'error', message: e?.message || 'Failed to create category' })
    } finally {
      setCatBusy(false)
    }
  }

  async function updateCategory() {
    if (!editingCategoryId) return
    if (!editingCategoryName.trim()) {
      showToast({ type: 'error', message: 'Category name is required' })
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
      if (!res.ok) throw new Error(data?.error || 'Failed to update category')

      setEditingCategoryId(null)
      setEditingCategoryName('')
      setEditingCategoryIcon('')
      setEditingCategoryImageUrl('')
      await fetchCategories()
      showToast({ type: 'success', message: 'Category updated' })
    } catch (e: any) {
      showToast({ type: 'error', message: e?.message || 'Failed to update category' })
    } finally {
      setCatBusy(false)
    }
  }

  async function deleteCategory(categoryId: string) {
    if (!window.confirm('Delete this category? This may break existing courses if not handled.')) return

    setCatBusy(true)
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to delete category')

      if (courseForm.categoryId === categoryId) {
        setCourseForm((p) => ({ ...p, categoryId: '' }))
      }

      await fetchCategories()
      await fetchCourses()
      showToast({ type: 'success', message: 'Category deleted' })
    } catch (e: any) {
      showToast({ type: 'error', message: e?.message || 'Failed to delete category' })
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
    if (!courseForm.title.trim()) return showToast({ type: 'error', message: 'Title is required' })
    if (!courseForm.description.trim()) return showToast({ type: 'error', message: 'Description is required' })
    if (!courseForm.categoryId) return showToast({ type: 'error', message: 'Category is required' })
    if (!courseForm.pdfUrl.trim()) return showToast({ type: 'error', message: 'pdfUrl is required' })

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
      if (!res.ok) throw new Error(data?.error || 'Failed to save course')

      await fetchCourses()
      resetCourseForm()
      showToast({ type: 'success', message: editingCourseId ? 'Course updated' : 'Course created' })
    } catch (e: any) {
      showToast({ type: 'error', message: e?.message || 'Failed to save course' })
    } finally {
      setCourseBusy(false)
    }
  }

  async function deleteCourse(courseId: string) {
    if (!window.confirm('Delete this course?')) return

    setCourseBusy(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to delete course')

      await fetchCourses()
      if (editingCourseId === courseId) resetCourseForm()
      showToast({ type: 'success', message: 'Course deleted' })
    } catch (e: any) {
      showToast({ type: 'error', message: e?.message || 'Failed to delete course' })
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

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={siteTitleClass}>Admin panel</h1>
          <p className={`${siteMutedClass} mt-2`}>Manage categories and PDF courses.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('categories')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'categories' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setTab('courses')}
            className={`rounded px-3 py-2 text-sm border ${
              tab === 'courses' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'
            }`}
          >
            Courses
          </button>
        </div>
      </div>

      {tab === 'categories' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create Category</h2>

            <div className="space-y-3">
              <Field label="Name">
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="e.g. Programming"
                />
              </Field>
              <Field label="Icon (optional)">
                <input
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="Key: laptop, business, folder — or an emoji"
                />
              </Field>
              <Field label="Card image URL (optional)">
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
                {catBusy ? 'Working...' : 'Create'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">All Categories</h2>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-gray-600">No categories yet.</p>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className="flex flex-col gap-2 rounded border p-3">
                    {editingCategoryId === c.id ? (
                      <>
                        <input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="w-full rounded border px-3 py-2"
                          placeholder="Name"
                        />
                        <input
                          value={editingCategoryIcon}
                          onChange={(e) => setEditingCategoryIcon(e.target.value)}
                          className="w-full rounded border px-3 py-2"
                          placeholder="Icon key or emoji"
                        />
                        <input
                          value={editingCategoryImageUrl}
                          onChange={(e) => setEditingCategoryImageUrl(e.target.value)}
                          className="w-full rounded border px-3 py-2"
                          placeholder="Card image URL"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={catBusy}
                            onClick={updateCategory}
                            className="flex-1 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Save
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
                            Cancel
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
                                {c.icon ? <span>Icon: {c.icon}</span> : null}
                                {c.icon && c.imageUrl ? ' · ' : null}
                                {c.imageUrl ? <span className="break-all">Image set</span> : null}
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
                              Edit
                            </button>
                            <button
                              disabled={catBusy}
                              onClick={() => deleteCategory(c.id)}
                              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                            >
                              Delete
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
            <h2 className="text-xl font-semibold mb-4">{editingCourseId ? 'Edit Course' : 'Create Course'}</h2>

            <div className="space-y-4">
              <Field label="Title">
                <input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={4}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={courseForm.categoryId}
                    onChange={(e) => setCourseForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Workload Hours">
                  <input
                    type="number"
                    min={0}
                    value={courseForm.workloadHours}
                    onChange={(e) => setCourseForm((p) => ({ ...p, workloadHours: Number(e.target.value) }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </Field>
              </div>

              <Field label="PDF URL">
                <input
                  value={courseForm.pdfUrl}
                  onChange={(e) => setCourseForm((p) => ({ ...p, pdfUrl: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="https://..."
                />
              </Field>

              <Field label="Thumbnail URL (optional)">
                <input
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                />
              </Field>

              <Field label="Syllabus (optional)">
                <textarea
                  value={courseForm.syllabus}
                  onChange={(e) => setCourseForm((p) => ({ ...p, syllabus: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="SEO Title (optional)">
                  <input
                    value={courseForm.seoTitle}
                    onChange={(e) => setCourseForm((p) => ({ ...p, seoTitle: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </Field>

                <Field label="SEO Description (optional)">
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
                  {courseBusy ? 'Saving...' : editingCourseId ? 'Update' : 'Create'}
                </button>
                <button
                  disabled={courseBusy}
                  onClick={resetCourseForm}
                  className="rounded border px-4 py-2 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Selected category: {selectedCategoryName || '—'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">All Courses</h2>
            <div className="space-y-3">
              {courses.length === 0 ? (
                <p className="text-gray-600">No courses yet.</p>
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
                          Edit
                        </button>
                        <button
                          disabled={courseBusy}
                          onClick={() => deleteCourse(c.id)}
                          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                        >
                          Delete
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

