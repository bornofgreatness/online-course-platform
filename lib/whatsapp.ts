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
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5574981045147'

export const PLATFORM_WHATSAPP_DISPLAY = '(74) 98104-5147'

export const PLATFORM_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'conect736@gmail.com'

export const PROMO_WHATSAPP_MESSAGE =
  'Olá! Vim pelo site da plataforma de cursos e gostaria de saber mais sobre os planos de assinatura.'
