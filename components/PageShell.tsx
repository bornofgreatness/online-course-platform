import type { ReactNode } from 'react'

/** Shared page background and horizontal padding (matches courses listing). */
export default function PageShell({
  children,
  className = '',
  centered = false,
}: {
  children: ReactNode
  className?: string
  /** Vertically center content (auth-style pages). */
  centered?: boolean
}) {
  const base =
    'min-h-screen bg-slate-100/80 px-4 pb-10 pt-4 lg:px-8 lg:pb-10 lg:pt-6 ' + className
  if (centered) {
    return (
      <div
        className={`${base} flex flex-col items-center justify-start py-10 sm:justify-center sm:py-12`}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    )
  }
  return <div className={base}>{children}</div>
}

/** White panel used across the app (cards, forms on slate background). */
export const siteCardClass = 'rounded-xl bg-white shadow-md ring-1 ring-black/5'

/** Primary page heading */
export const siteTitleClass = 'text-2xl font-bold text-blue-950 sm:text-3xl'

/** Muted subtitle / body secondary */
export const siteMutedClass = 'text-sm text-slate-600 sm:text-base'
