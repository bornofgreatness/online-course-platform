'use client'

import Link from 'next/link'
import { getCourseCardDisplay, initialsFromName } from '../lib/courseCardDisplay'
import { useI18n } from './LanguageProvider'

export type CourseListCardCourse = {
  id: string
  title: string
  description: string
  thumbnailUrl?: string | null
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
      <svg className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-xs font-semibold tabular-nums text-slate-800 sm:text-sm">{value.toFixed(1)}</span>
    </div>
  )
}

/** Horizontal course card matching the /courses catalog layout. */
export default function CourseListCard({ course }: { course: CourseListCardCourse }) {
  const d = getCourseCardDisplay(course.id)
  const initials = initialsFromName(d.instructor)
  const { t } = useI18n()

  return (
    <article className="flex flex-row overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg h-32 sm:h-40">
      <div className="flex flex-shrink-0 items-center justify-center" style={{ width: '60%', minWidth: '120px', maxWidth: '180px' }}>
        <div className="ml-1.5 mr-3 h-[calc(100%-16px)] w-[calc(100%-18px)] overflow-hidden rounded-lg sm:rounded-xl">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-2xl text-slate-500">
              📚
            </div>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2 sm:pr-2.5">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="line-clamp-1 text-sm font-bold leading-tight text-blue-950 sm:text-base">{course.title}</h3>
            <StarRating value={d.rating} />
          </div>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-600 sm:text-xs">{course.description}</p>
          <div className="mt-0.5 flex items-center gap-1">
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[6px] font-bold sm:h-5 sm:w-5 sm:text-[7px] ${d.avatarClass}`}
            >
              {initials}
            </div>
            <span className="truncate text-[10px] font-medium text-slate-700">{d.instructor}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-bold tabular-nums text-blue-950 sm:text-sm">{d.priceLabel}</span>
          <Link
            href={`/courses/${course.id}`}
            className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-blue-700 sm:px-3 sm:py-1.5 sm:text-xs"
          >
            {t('common.access')}
          </Link>
        </div>
      </div>
    </article>
  )
}
