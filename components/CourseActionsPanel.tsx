'use client'

import { Suspense, type ComponentProps } from 'react'
import CourseActions from './CourseActions'
import LoadingImage from './LoadingImage'
import { sitePanelClass } from '../lib/ui/siteStyles'

type Props = ComponentProps<typeof CourseActions>

function CourseActionsFallback() {
  return (
    <div className={sitePanelClass}>
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
