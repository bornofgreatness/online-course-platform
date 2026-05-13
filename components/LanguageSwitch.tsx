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
      className={`inline-flex items-center rounded-full border border-slate-300 bg-white p-0.5 shadow-sm ${
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
            language === option.value ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
          aria-pressed={language === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
