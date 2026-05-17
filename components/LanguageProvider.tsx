'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  LANG_COOKIE,
  translate,
  type Language,
  type TranslationKey,
} from '../lib/i18n/translations'

export type { Language, TranslationKey }

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function persistLanguage(lang: Language) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('language', lang)
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000;samesite=lax`
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt')

  useEffect(() => {
    const stored = window.localStorage.getItem('language')
    const fromCookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${LANG_COOKIE}=`))
      ?.split('=')[1]

    const initial =
      (stored === 'en' || stored === 'pt' ? stored : null) ||
      (fromCookie === 'en' || fromCookie === 'pt' ? fromCookie : null) ||
      'pt'

    setLanguageState(initial)
    persistLanguage(initial)
  }, [])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    persistLanguage(next)
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) => translate(language, key, values),
    }),
    [language]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within LanguageProvider')
  return context
}

export function LocalizedText({
  textKey,
  values,
}: {
  textKey: TranslationKey
  values?: Record<string, string | number>
}) {
  const { t } = useI18n()
  return <>{t(textKey, values)}</>
}
