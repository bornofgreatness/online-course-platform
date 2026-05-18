'use client'

import Link from 'next/link'
import { useI18n } from './LanguageProvider'

export type CourseListCardCourse = {
  id: string
  title: string
  description: string
  thumbnailUrl?: string | null
}

/** Horizontal course card matching the /courses catalog layout. */
export default function CourseListCard({ course }: { course: CourseListCardCourse }) {
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
          </div>
          <p className="mt-1 line-clamp-3 text-[10px] leading-tight text-slate-600 sm:text-xs">{course.description}</p>
        </div>
        <div className="mt-2 flex items-center justify-end gap-1.5">
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
