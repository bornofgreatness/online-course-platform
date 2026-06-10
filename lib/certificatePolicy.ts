/** CONECT CURSOS — digital certificate issuance policy. */

export const BRAND_NAME = 'CONECT CURSOS'

/** Shown on certificate PDF: "Cidade - UF, dia de mês de ano." */
export const CERTIFICATE_ISSUANCE_CITY =
  process.env.CERTIFICATE_ISSUANCE_CITY?.trim() || 'Juazeiro'

export const CERTIFICATE_ISSUANCE_STATE =
  process.env.CERTIFICATE_ISSUANCE_STATE?.trim() || 'BA'

/** R$ 9.00 per certificate (BRL; charged via Mercado Pago). */
export const CERTIFICATE_ISSUANCE_FEE_CENTS = 900

export const CERTIFICATE_ISSUANCE_FEE_BRL = CERTIFICATE_ISSUANCE_FEE_CENTS / 100

export function certificateFeeEnabled(): boolean {
  return process.env.CERTIFICATE_FEE_ENABLED !== 'false'
}

export function formatCertificateFeeBrl(locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(CERTIFICATE_ISSUANCE_FEE_BRL)
}
