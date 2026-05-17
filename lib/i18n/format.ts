import type { Language } from './translations'

export function formatMoney(cents: number, language: Language): string {
  const locale = language === 'pt' ? 'pt-BR' : 'en-US'
  return (cents / 100).toLocaleString(locale, { style: 'currency', currency: 'BRL' })
}
