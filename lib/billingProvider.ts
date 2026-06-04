/** Which checkout providers are active (subscriptions + certificate fee). */

export function isMercadoPagoPaymentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MERCADOPAGO_ENABLED !== 'false'
}

export function isStripePaymentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true'
}

export function isStripeConfigured(): boolean {
  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  return Boolean(secret && !secret.includes('your_key') && secret.length >= 30)
}

export function preferMercadoPagoCheckout(): boolean {
  if (!isMercadoPagoPaymentEnabled()) return false
  if (!isStripePaymentEnabled()) return true
  return process.env.NEXT_PUBLIC_PAYMENT_PROVIDER !== 'stripe'
}

export type CheckoutProvider = 'mercadopago' | 'stripe'

export function defaultCheckoutProvider(): CheckoutProvider {
  if (preferMercadoPagoCheckout()) return 'mercadopago'
  if (isStripePaymentEnabled() && isStripeConfigured()) return 'stripe'
  return 'mercadopago'
}
