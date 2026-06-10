import type { PrismaClient } from '@prisma/client'
import {
  CERTIFICATE_ISSUANCE_CITY,
  CERTIFICATE_ISSUANCE_STATE,
} from './certificatePolicy'

const CITY_KEY = 'certificate_issuance_city'
const STATE_KEY = 'certificate_issuance_state'

export type CertificateIssuanceLocation = {
  city: string
  state: string
}

export function defaultCertificateIssuanceLocation(): CertificateIssuanceLocation {
  return {
    city: CERTIFICATE_ISSUANCE_CITY,
    state: CERTIFICATE_ISSUANCE_STATE,
  }
}

export async function getCertificateIssuanceLocation(
  prisma: PrismaClient
): Promise<CertificateIssuanceLocation> {
  try {
    const rows = await prisma.platformSetting.findMany({
      where: { key: { in: [CITY_KEY, STATE_KEY] } },
    })
    const map = Object.fromEntries(rows.map((row) => [row.key, row.value]))
    return {
      city: map[CITY_KEY]?.trim() || CERTIFICATE_ISSUANCE_CITY,
      state: (map[STATE_KEY]?.trim() || CERTIFICATE_ISSUANCE_STATE).toUpperCase(),
    }
  } catch {
    return defaultCertificateIssuanceLocation()
  }
}

export function validateCertificateIssuanceLocation(input: {
  city: string
  state: string
}): CertificateIssuanceLocation {
  const city = input.city.trim()
  const state = input.state.trim().toUpperCase()

  if (!city || city.length > 80) {
    throw new Error('Invalid city')
  }
  if (!/^[A-Z]{2}$/.test(state)) {
    throw new Error('Invalid state (use 2-letter UF, e.g. BA)')
  }

  return { city, state }
}

export async function setCertificateIssuanceLocation(
  prisma: PrismaClient,
  input: { city: string; state: string }
): Promise<CertificateIssuanceLocation> {
  const location = validateCertificateIssuanceLocation(input)

  await prisma.$transaction([
    prisma.platformSetting.upsert({
      where: { key: CITY_KEY },
      create: { key: CITY_KEY, value: location.city },
      update: { value: location.city },
    }),
    prisma.platformSetting.upsert({
      where: { key: STATE_KEY },
      create: { key: STATE_KEY, value: location.state },
      update: { value: location.state },
    }),
  ])

  return location
}
