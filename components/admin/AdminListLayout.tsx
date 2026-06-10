'use client'

import type { ReactNode } from 'react'
import {
  adminActionBtnClass,
  adminDangerBtnClass,
  adminMobileCardClass,
  adminMobileListClass,
  adminTableClass,
  adminTableWrapClass,
} from './adminStyles'

export function AdminMobileList({ children }: { children: ReactNode }) {
  return <div className={`${adminMobileListClass} md:hidden`}>{children}</div>
}

export function AdminDesktopTable({ children }: { children: ReactNode }) {
  return (
    <div className={`${adminTableWrapClass} hidden md:block`}>
      <table className={adminTableClass}>{children}</table>
    </div>
  )
}

export function AdminMobileCard({ children }: { children: ReactNode }) {
  return <article className={adminMobileCardClass}>{children}</article>
}

export function AdminMobileHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 border-b border-slate-100 pb-3">
      <h3 className="text-base font-semibold leading-snug text-slate-900">{title}</h3>
      {subtitle ? <p className="mt-1 break-all text-xs text-slate-600 sm:text-sm">{subtitle}</p> : null}
    </div>
  )
}

export function AdminMobileField({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`grid grid-cols-1 gap-1 md:grid-cols-[minmax(0,7.5rem)_1fr] md:gap-x-3 ${className}`}>
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</dt>
      <dd className="min-w-0 text-sm text-slate-900">{children}</dd>
    </div>
  )
}

export function AdminMobileActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 md:flex-row md:flex-wrap">
      {children}
    </div>
  )
}

export function AdminMobileStatGrid({ children }: { children: ReactNode }) {
  return <div className="mt-3 grid grid-cols-2 gap-2">{children}</div>
}

export function AdminMobileStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}

export { adminActionBtnClass, adminDangerBtnClass }
