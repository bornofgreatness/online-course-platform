'use client'

import Link from 'next/link'
import { courseDisplayTitle } from '../lib/courseDisplay'
import { siteCardClass, siteCardHoverClass, sitePrimaryBtnClass } from '../lib/ui/siteStyles'
import { useI18n } from './LanguageProvider'

export type CourseListCardCourse = {
  id: string
  title: string
  description: string
  thumbnailUrl?: string | null
  workloadHours: number
}

/** Horizontal course card — course name first, then duration. */
export default function CourseListCard({ course }: { course: CourseListCardCourse }) {
  const { t } = useI18n()
  const name = courseDisplayTitle(course.title)
  const hours = course.workloadHours

  return (
    <article className={`flex h-32 flex-row overflow-hidden sm:h-40 ${siteCardClass} ${siteCardHoverClass}`}>
      <div
        className="flex flex-shrink-0 items-center justify-center"
        style={{ width: '60%', minWidth: '120px', maxWidth: '180px' }}
      >
        <div className="ml-1.5 mr-3 h-[calc(100%-16px)] w-[calc(100%-18px)] overflow-hidden rounded-lg sm:rounded-xl">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-2xl text-slate-500">
              📚
            </div>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2 sm:pr-2.5">
        <div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-blue-950 sm:text-base">{name}</h3>
          <p className="mt-0.5 text-[11px] font-semibold text-teal-700 sm:text-xs">
            {t('course.workload', { hours })}
          </p>
          <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-slate-600 sm:text-xs">{course.description}</p>
        </div>
        <div className="mt-2 flex items-center justify-end gap-1.5">
          <Link
            href={`/courses/${course.id}`}
            className={`shrink-0 px-2.5 py-1 text-center text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:py-1.5 sm:text-xs ${sitePrimaryBtnClass}`}
          >
            {t('common.access')}
          </Link>
        </div>
      </div>
    </article>
  )
}
