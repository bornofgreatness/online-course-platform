/** Mercado Pago is the only checkout provider. */

export function isMercadoPagoPaymentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MERCADOPAGO_ENABLED !== 'false'
}
