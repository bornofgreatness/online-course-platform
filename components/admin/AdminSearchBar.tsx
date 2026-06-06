'use client'

import { adminSearchInputClass, adminSecondaryBtnClass } from './adminStyles'

type AdminSearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  onSubmit?: () => void
  submitLabel?: string
  className?: string
  id?: string
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder,
  onSubmit,
  submitLabel = 'Search',
  className = '',
  id,
}: AdminSearchBarProps) {
  const input = (
    <div className={`relative min-w-0 flex-1 ${className}`}>
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
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={adminSearchInputClass}
        onKeyDown={
          onSubmit
            ? (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSubmit()
                }
              }
            : undefined
        }
      />
    </div>
  )

  if (onSubmit) {
    return (
      <form
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        {input}
        <button type="submit" className={`${adminSecondaryBtnClass} w-full shrink-0 sm:w-auto`}>
          {submitLabel}
        </button>
      </form>
    )
  }

  return input
}
