'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useI18n } from './LanguageProvider'
import {
  siteMobileQuickBlackClass,
  siteMobileQuickBlueClass,
  siteMobileQuickGreenClass,
  siteMobileQuickStackClass,
} from '../lib/ui/siteStyles'

function MobileCourseSearch({
  value,
  onChange,
  onKeyDown,
  placeholder,
}: {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-slate-400"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  )
}

export default function MobileQuickNav() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const isCoursesPage = pathname === '/courses'
  const urlQuery = searchParams.get('q') ?? ''
  const [search, setSearch] = useState(urlQuery)

  useEffect(() => {
    setSearch(urlQuery)
  }, [urlQuery])

  const updateCoursesQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) params.set('q', value)
      else params.delete('q')
      const query = params.toString()
      router.replace(query ? `/courses?${query}` : '/courses', { scroll: false })
    },
    [router, searchParams]
  )

  const handleAvailableCourses = useCallback(() => {
    if (isCoursesPage) {
      document.getElementById('courses-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    router.push('/courses')
  }, [isCoursesPage, router])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearch(value)
    if (isCoursesPage) updateCoursesQuery(value)
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isCoursesPage && search.trim()) {
      router.push(`/courses?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="border-b border-slate-200/80 bg-slate-50 px-4 pb-4 pt-3 lg:hidden">
      <div className="space-y-3">
        <nav className={siteMobileQuickStackClass} aria-label={t('course.available')}>
          <div
            role="button"
            tabIndex={0}
            onClick={handleAvailableCourses}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleAvailableCourses()
              }
            }}
            className={`cursor-pointer bg-black text-white ${siteMobileQuickBlackClass}`}
          >
            {t('course.available')}
          </div>
          {status !== 'loading' && session ? (
            <Link href="/dashboard" className={siteMobileQuickGreenClass}>
              {t('common.dashboard')}
            </Link>
          ) : (
            <Link href="/auth/signin" className={siteMobileQuickGreenClass}>
              {t('common.loginSignup')}
            </Link>
          )}
          <Link href="/certificates" className={siteMobileQuickBlueClass}>
            {t('common.certificates')}
          </Link>
        </nav>
        <label className="block">
          <span className="sr-only">{t('course.search')}</span>
          <MobileCourseSearch
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('course.search')}
          />
        </label>
      </div>
    </div>
  )
}
