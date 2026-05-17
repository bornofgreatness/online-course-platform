export type CourseProgress = {
  completed: boolean
  lastPage: number
  lastViewedAt?: string
}

export function parseCourseProgress(raw: string | null | undefined): CourseProgress {
  const fallback: CourseProgress = { completed: false, lastPage: 0 }
  if (!raw?.trim()) return fallback
  try {
    const p = JSON.parse(raw) as Partial<CourseProgress>
    return {
      completed: !!p.completed,
      lastPage: typeof p.lastPage === 'number' ? p.lastPage : 0,
      lastViewedAt: typeof p.lastViewedAt === 'string' ? p.lastViewedAt : undefined,
    }
  } catch {
    return fallback
  }
}

export function touchLastViewed(progress: CourseProgress): CourseProgress {
  return { ...progress, lastViewedAt: new Date().toISOString() }
}

export function progressSortKey(raw: string | null | undefined, enrolledAt: Date): number {
  const p = parseCourseProgress(raw)
  if (p.lastViewedAt) {
    const t = Date.parse(p.lastViewedAt)
    if (!Number.isNaN(t)) return t
  }
  return enrolledAt.getTime()
}
