'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type NavCategory = { id: string; name: string; courseCount: number }

export default function Header() {
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: NavCategory[]) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!categoriesOpen) return
    const onDoc = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [categoriesOpen])

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="text-lg font-semibold">
          <Link href="/" className="hover:text-blue-600">
            Online Course Platform
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <span className="text-gray-500">Loading...</span>
          ) : session ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500 px-4 py-2 text-red-500 transition hover:bg-red-50"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="rounded-lg border border-blue-500 px-4 py-2 text-blue-500 transition hover:bg-blue-50"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-3">
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/courses" className="text-blue-500 hover:underline">
            Courses
          </Link>
          <div className="relative" ref={categoriesRef}>
            <button
              type="button"
              onClick={() => setCategoriesOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-blue-500 hover:underline"
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
            >
              Categories
              <span className="text-xs" aria-hidden>
                ▾
              </span>
            </button>
            {categoriesOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1 max-h-[min(70vh,20rem)] min-w-[14rem] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                <Link
                  href="/categories"
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => setCategoriesOpen(false)}
                >
                  All categories
                </Link>
                {categories.length > 0 && (
                  <>
                    <div className="my-1 border-t border-gray-100" />
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.id}`}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                        role="menuitem"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="ml-1 text-xs text-gray-400">({c.courseCount})</span>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          {status === 'loading' ? null : session ? (
            <>
              <Link href="/dashboard" className="text-blue-500 hover:underline">
                Dashboard
              </Link>
              <Link href="/certificates" className="text-blue-500 hover:underline">
                Certificates
              </Link>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link href="/admin" className="text-blue-500 hover:underline">
                  Admin
                </Link>
              )}
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
