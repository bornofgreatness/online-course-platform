'use client'

import { Suspense, type ComponentProps } from 'react'
import CourseActions from './CourseActions'
import LoadingImage from './LoadingImage'

type Props = ComponentProps<typeof CourseActions>

function CourseActionsFallback() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <LoadingImage size="sm" className="py-4" />
    </div>
  )
}

export default function CourseActionsPanel(props: Props) {
  return (
    <Suspense fallback={<CourseActionsFallback />}>
      <CourseActions {...props} />
    </Suspense>
  )
}
