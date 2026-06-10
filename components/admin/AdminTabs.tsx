'use client'

import { adminTabButtonClass, type AdminTab } from './adminStyles'

type TabItem = {
  id: AdminTab
  label: string
}

type AdminTabsProps = {
  tabs: TabItem[]
  value: AdminTab
  onChange: (tab: AdminTab) => void
  mobileLabel?: string
}

export default function AdminTabs({ tabs, value, onChange, mobileLabel = 'Section' }: AdminTabsProps) {
  return (
    <div className="space-y-3">
      <label className="block md:hidden">
        <span className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">{mobileLabel}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AdminTab)}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </label>

      <div className="hidden md:block">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={adminTabButtonClass(value === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
