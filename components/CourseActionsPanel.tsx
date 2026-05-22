'use client'

import { Suspense, type ComponentProps } from 'react'
import CourseActions from './CourseActions'

type Props = ComponentProps<typeof CourseActions>

function CourseActionsFallback() {
  return <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
}

export default function CourseActionsPanel(props: Props) {
  return (
    <Suspense fallback={<CourseActionsFallback />}>
      <CourseActions {...props} />
    </Suspense>
  )
}
