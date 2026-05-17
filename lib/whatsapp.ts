/** Build wa.me link for Brazilian numbers (digits only, with country code 55). */
export function whatsappLink(phone: string, message?: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.length <= 11 && !digits.startsWith('55')) {
    digits = `55${digits}`
  }
  const base = `https://wa.me/${digits}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export const PLATFORM_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'

export const PROMO_WHATSAPP_MESSAGE =
  'Olá! Vim pelo site da plataforma de cursos e gostaria de saber mais sobre os planos de assinatura.'
