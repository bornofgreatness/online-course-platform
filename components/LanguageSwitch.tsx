'use client'

import { useI18n, type Language } from './LanguageProvider'

const options: Array<{ value: Language; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'pt', label: 'PT' },
]

export default function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n()

  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-sm ring-1 ring-black/5 ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
      aria-label={t('common.language')}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          className={`rounded-full px-2.5 py-1 font-bold transition ${
            language === option.value
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={language === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
