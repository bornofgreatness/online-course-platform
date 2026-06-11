import fs from 'fs'
import path from 'path'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { BRAND_NAME } from './certificatePolicy'
import { getCertificateLogoPng, getCertificatePaperRgb } from './certificateLogo'
import { defaultCertificateIssuanceLocation } from './certificateSettings'

export type CertificatePdfData = {
  holderName: string
  courseTitle: string
  workloadHours: number
  certificateNumber: string
  issuedAt: Date
  holderEmail?: string | null
  issuanceCity?: string
  issuanceState?: string
}

const PAGE_WIDTH = 792
const PAGE_HEIGHT = 612
const CENTER_X = PAGE_WIDTH / 2

const NAVY = rgb(0.08, 0.16, 0.36)
const NAVY_MUTED = rgb(0.12, 0.2, 0.4)
const GOLD = rgb(0.82, 0.66, 0.14)
const FOOTER_WHITE = rgb(1, 1, 1)

const LOGO_TOP_Y = 568
const LOGO_TITLE_GAP = 46
const CONTENT_MAX_WIDTH = 470
const LEGAL_MAX_WIDTH = 430
const LEFT_SIG_X = 154
const RIGHT_SIG_X = 638
const SIG_LINE_WIDTH = 196

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const

const LEGAL_TEXT =
  'Curso Livre de Formação Inicial e Continuada, fundamentado no Decreto Nº 5.154, de 23 de Julho de 2004, Art. 1º e em conformidade com as normas do Ministério da Educação (MEC) através da Resolução CNE nº 04/99, Art. 11º. Válido em todo o Território Nacional.'

type Fonts = {
  regular: PDFFont
  bold: PDFFont
}

export async function buildCertificatePdf(data: CertificatePdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const fonts: Fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  }

  await drawBackground(pdfDoc, page)

  const hours = data.workloadHours || 100
  const defaults = defaultCertificateIssuanceLocation()
  const issuanceCity = data.issuanceCity?.trim() || defaults.city
  const issuanceState = (data.issuanceState?.trim() || defaults.state).toUpperCase()
  const issuanceLine = formatIssuanceLine(data.issuedAt, issuanceCity, issuanceState)
  const verifyUrl = formatVerifyUrl(data.certificateNumber)

  const logoBottomY = await drawLogo(pdfDoc, page, LOGO_TOP_Y)
  let y = logoBottomY - LOGO_TITLE_GAP

  y = drawCenteredText(page, fonts.bold, 'CERTIFICADO DE CONCLUSÃO', y, 22, NAVY)
  y -= 4
  drawGoldSeparator(page, y)
  y -= 20

  y = drawCenteredText(page, fonts.regular, 'Certificamos que', y, 12, NAVY_MUTED)
  y -= 14

  const holderLines = wrapText(data.holderName.toUpperCase(), fonts.bold, 20, CONTENT_MAX_WIDTH)
  for (const line of holderLines.slice(0, 2)) {
    y = drawCenteredText(page, fonts.bold, line, y, 20, NAVY)
    y -= 6
  }
  y -= 4

  y = drawCenteredText(page, fonts.regular, 'concluiu com êxito o curso de', y, 12, NAVY_MUTED)
  y -= 14

  const courseLines = wrapText(data.courseTitle.toUpperCase(), fonts.bold, 17, CONTENT_MAX_WIDTH)
  for (const line of courseLines.slice(0, 3)) {
    y = drawCenteredText(page, fonts.bold, line, y, 17, NAVY)
    y -= 6
  }
  y -= 4

  y = drawCenteredText(
    page,
    fonts.regular,
    `com carga horária de ${hours} horas/aula.`,
    y,
    12,
    NAVY_MUTED
  )
  y -= 22

  y = drawCenteredText(page, fonts.bold, 'Base Legal', y, 10, NAVY)
  y -= 12
  y = drawCenteredWrapped(page, fonts.regular, LEGAL_TEXT, y, 8.5, LEGAL_MAX_WIDTH, NAVY_MUTED, 10.5)
  y -= 14

  drawCenteredText(
    page,
    fonts.bold,
    `Local e Data de Emissão: ${issuanceLine}`,
    y,
    10,
    NAVY
  )

  drawSignatureSection(page, fonts, data.holderName)

  drawCenteredText(
    page,
    fonts.regular,
    `Código de verificação: ${data.certificateNumber}`,
    36,
    8,
    FOOTER_WHITE
  )
  drawCenteredText(
    page,
    fonts.regular,
    'Verifique a autenticidade deste certificado em:',
    25,
    7.5,
    FOOTER_WHITE
  )
  drawCenteredText(page, fonts.bold, verifyUrl, 14, 8, FOOTER_WHITE)

  return pdfDoc.save()
}

function formatIssuanceLine(date: Date, city: string, state: string): string {
  const day = date.getDate()
  const month = MONTHS_PT[date.getMonth()] ?? 'janeiro'
  const year = date.getFullYear()
  return `${city} - ${state}, ${day} de ${month} de ${year}.`
}

function formatVerifyUrl(certificateNumber: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'
  const host = base.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return `${host}/verify/certificate/${encodeURIComponent(certificateNumber)}`
}

async function drawBackground(pdfDoc: PDFDocument, page: PDFPage) {
  const jpgPath = path.join(process.cwd(), 'public', 'certificate-template.jpg')
  const pngPath = path.join(process.cwd(), 'public', 'certificate-template.png')

  try {
    if (fs.existsSync(jpgPath)) {
      const image = await pdfDoc.embedJpg(fs.readFileSync(jpgPath))
      page.drawImage(image, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT })
      return
    }
    if (fs.existsSync(pngPath)) {
      const image = await pdfDoc.embedPng(fs.readFileSync(pngPath))
      page.drawImage(image, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT })
    }
  } catch {
    const paper = await getCertificatePaperRgb()
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: rgb(paper.r / 255, paper.g / 255, paper.b / 255),
    })
  }
}

async function drawLogo(pdfDoc: PDFDocument, page: PDFPage, topY: number): Promise<number> {
  const maxHeight = 44

  try {
    const logoBytes = await getCertificateLogoPng()
    if (!logoBytes) return topY - maxHeight

    const logo = await pdfDoc.embedPng(logoBytes)
    const scale = maxHeight / logo.height
    const width = logo.width * scale
    const height = logo.height * scale
    const x = CENTER_X - width / 2
    const y = topY - height

    page.drawImage(logo, { x, y, width, height })
    return y
  } catch {
    return topY - maxHeight
  }
}

function drawGoldSeparator(page: PDFPage, y: number) {
  const lineWidth = 210
  page.drawLine({
    start: { x: CENTER_X - lineWidth / 2, y },
    end: { x: CENTER_X + lineWidth / 2, y },
    thickness: 1.2,
    color: GOLD,
  })
  const d = 3.5
  page.drawLine({
    start: { x: CENTER_X, y: y + d },
    end: { x: CENTER_X + d, y },
    thickness: 1.2,
    color: GOLD,
  })
  page.drawLine({
    start: { x: CENTER_X + d, y },
    end: { x: CENTER_X, y: y - d },
    thickness: 1.2,
    color: GOLD,
  })
  page.drawLine({
    start: { x: CENTER_X, y: y - d },
    end: { x: CENTER_X - d, y },
    thickness: 1.2,
    color: GOLD,
  })
  page.drawLine({
    start: { x: CENTER_X - d, y },
    end: { x: CENTER_X, y: y + d },
    thickness: 1.2,
    color: GOLD,
  })
}

function drawCenteredText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  y: number,
  size: number,
  color: ReturnType<typeof rgb>
): number {
  const width = font.widthOfTextAtSize(text, size)
  page.drawText(text, {
    x: CENTER_X - width / 2,
    y,
    size,
    font,
    color,
  })
  return y - size - 2
}

function drawCenteredWrapped(
  page: PDFPage,
  font: PDFFont,
  text: string,
  startY: number,
  size: number,
  maxWidth: number,
  color: ReturnType<typeof rgb>,
  lineHeight: number
): number {
  const lines = wrapText(text, font, size, maxWidth)
  let y = startY
  for (const line of lines) {
    drawCenteredText(page, font, line, y, size, color)
    y -= lineHeight
  }
  return y
}

function drawSignatureSection(page: PDFPage, fonts: Fonts, holderName: string) {
  const lineY = 132
  const labelY = 110
  const roleY = 96

  page.drawLine({
    start: { x: LEFT_SIG_X, y: lineY },
    end: { x: LEFT_SIG_X + SIG_LINE_WIDTH, y: lineY },
    thickness: 1.2,
    color: GOLD,
  })
  page.drawLine({
    start: { x: RIGHT_SIG_X - SIG_LINE_WIDTH, y: lineY },
    end: { x: RIGHT_SIG_X, y: lineY },
    thickness: 1.2,
    color: GOLD,
  })

  const leftCenter = LEFT_SIG_X + SIG_LINE_WIDTH / 2
  const rightCenter = RIGHT_SIG_X - SIG_LINE_WIDTH / 2

  drawTextCenteredAt(page, fonts.bold, BRAND_NAME, leftCenter, labelY, 11, NAVY)
  drawTextCenteredAt(page, fonts.regular, 'Direção Acadêmica', leftCenter, roleY, 9, NAVY_MUTED)

  const holderLines = wrapText(holderName.toUpperCase(), fonts.bold, 9.5, SIG_LINE_WIDTH - 12).slice(0, 2)
  let holderY = labelY
  for (const line of holderLines) {
    drawTextCenteredAt(page, fonts.bold, line, rightCenter, holderY, 9.5, NAVY)
    holderY -= 12
  }
  drawTextCenteredAt(page, fonts.regular, 'Aluno(a)', rightCenter, roleY, 9, NAVY_MUTED)
}

function drawTextCenteredAt(
  page: PDFPage,
  font: PDFFont,
  text: string,
  centerX: number,
  y: number,
  size: number,
  color: ReturnType<typeof rgb>
) {
  const width = font.widthOfTextAtSize(text, size)
  page.drawText(text, {
    x: centerX - width / 2,
    y,
    size,
    font,
    color,
  })
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next
    } else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : [text]
}
