export type StripeCheckoutPaymentMethod = 'card' | 'pix' | 'boleto'

const ALLOWED = new Set<StripeCheckoutPaymentMethod>(['card', 'pix', 'boleto'])

/**
 * Payment methods for Stripe Checkout. Defaults to card only — PIX requires
 * activation in the Stripe Dashboard (Payments → Payment methods).
 * Override: STRIPE_CHECKOUT_PAYMENT_METHODS=card,pix
 */
export function stripeCheckoutPaymentMethods(): StripeCheckoutPaymentMethod[] {
  const raw = process.env.STRIPE_CHECKOUT_PAYMENT_METHODS?.trim()
  if (!raw) return ['card']

  const methods = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is StripeCheckoutPaymentMethod =>
      ALLOWED.has(s as StripeCheckoutPaymentMethod)
    )

  return methods.length > 0 ? methods : ['card']
}
