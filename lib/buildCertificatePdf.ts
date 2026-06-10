import fs from 'fs'
import path from 'path'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { BRAND_NAME } from './certificatePolicy'
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
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const CENTER_X = PAGE_WIDTH / 2

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
  oblique: PDFFont
}

export async function buildCertificatePdf(data: CertificatePdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const fonts: Fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    oblique: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
  }

  const hours = data.workloadHours || 100
  const defaults = defaultCertificateIssuanceLocation()
  const issuanceCity = data.issuanceCity?.trim() || defaults.city
  const issuanceState = (data.issuanceState?.trim() || defaults.state).toUpperCase()
  const issuanceLine = formatIssuanceLine(data.issuedAt, issuanceCity, issuanceState)

  drawPageFrame(page)
  let y = await drawLogo(pdfDoc, page, fonts, PAGE_HEIGHT - MARGIN)

  y = drawCentered(page, fonts, 'CERTIFICADO DE CONCLUSÃO', y, 22, fonts.bold, rgb(0.08, 0.16, 0.34))
  y -= 14
  y = drawCentered(page, fonts, 'Certificamos que', y, 12, fonts.regular, rgb(0.28, 0.28, 0.28))
  y -= 6
  y = drawCentered(page, fonts, data.holderName.toUpperCase(), y, 20, fonts.bold, rgb(0.05, 0.2, 0.45))
  y -= 10
  y = drawCentered(
    page,
    fonts,
    'concluiu com êxito o curso de:',
    y,
    12,
    fonts.regular,
    rgb(0.28, 0.28, 0.28)
  )
  y -= 6

  const courseLines = wrapText(data.courseTitle.toUpperCase(), fonts.bold, 18, CONTENT_WIDTH - 80)
  for (const line of courseLines) {
    y = drawCentered(page, fonts, line, y, 18, fonts.bold, rgb(0.08, 0.08, 0.08))
  }

  y -= 4
  y = drawCentered(
    page,
    fonts,
    `com carga horária de ${hours} horas/aulas.`,
    y,
    12,
    fonts.regular,
    rgb(0.28, 0.28, 0.28)
  )
  y -= 18

  y = drawWrappedBlock(
    page,
    fonts,
    'Base Legal:',
    LEGAL_TEXT,
    y,
    9,
    CONTENT_WIDTH - 40,
    rgb(0.22, 0.22, 0.22)
  )
  y -= 14

  y = drawCentered(
    page,
    fonts,
    `Local e Data de Emissão: ${issuanceLine}`,
    y,
    10,
    fonts.regular,
    rgb(0.2, 0.2, 0.2)
  )

  drawSignatureSection(page, fonts, data.holderName, 118)

  const verifyText = `Código de verificação: ${data.certificateNumber}`
  page.drawText(verifyText, {
    x: CENTER_X - fonts.regular.widthOfTextAtSize(verifyText, 8) / 2,
    y: 34,
    size: 8,
    font: fonts.regular,
    color: rgb(0.45, 0.45, 0.45),
  })

  return pdfDoc.save()
}

function formatIssuanceLine(date: Date, city: string, state: string): string {
  const day = date.getDate()
  const month = MONTHS_PT[date.getMonth()] ?? 'janeiro'
  const year = date.getFullYear()
  return `${city} - ${state}, ${day} de ${month} de ${year}.`
}

function drawPageFrame(page: PDFPage) {
  page.drawRectangle({
    x: MARGIN - 10,
    y: MARGIN - 10,
    width: PAGE_WIDTH - (MARGIN - 10) * 2,
    height: PAGE_HEIGHT - (MARGIN - 10) * 2,
    borderColor: rgb(0.78, 0.82, 0.88),
    borderWidth: 1.5,
  })
  page.drawRectangle({
    x: MARGIN - 4,
    y: MARGIN - 4,
    width: PAGE_WIDTH - (MARGIN - 4) * 2,
    height: PAGE_HEIGHT - (MARGIN - 4) * 2,
    borderColor: rgb(0.88, 0.9, 0.93),
    borderWidth: 0.75,
  })
}

async function drawLogo(
  pdfDoc: PDFDocument,
  page: PDFPage,
  fonts: Fonts,
  topY: number
): Promise<number> {
  const logoPath = path.join(process.cwd(), 'public', 'logo.jpg')
  try {
    const logoBytes = fs.readFileSync(logoPath)
    const logo = await pdfDoc.embedJpg(logoBytes)
    const maxHeight = 52
    const scale = maxHeight / logo.height
    const width = logo.width * scale
    const height = logo.height * scale
    page.drawImage(logo, {
      x: CENTER_X - width / 2,
      y: topY - height,
      width,
      height,
    })
    return topY - height - 18
  } catch {
    return drawCentered(page, fonts, BRAND_NAME, topY - 8, 16, fonts.bold, rgb(0.05, 0.45, 0.42))
  }
}

function drawCentered(
  page: PDFPage,
  fonts: Fonts,
  text: string,
  y: number,
  size: number,
  font: PDFFont,
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
  return y - size - 8
}

function drawWrappedBlock(
  page: PDFPage,
  fonts: Fonts,
  heading: string,
  body: string,
  startY: number,
  size: number,
  maxWidth: number,
  color: ReturnType<typeof rgb>
): number {
  let y = startY
  const headingWidth = fonts.bold.widthOfTextAtSize(heading, size)
  page.drawText(heading, {
    x: CENTER_X - headingWidth / 2,
    y,
    size,
    font: fonts.bold,
    color,
  })
  y -= size + 6

  const lines = wrapText(body, fonts.regular, size, maxWidth)
  for (const line of lines) {
    const lineWidth = fonts.regular.widthOfTextAtSize(line, size)
    page.drawText(line, {
      x: CENTER_X - lineWidth / 2,
      y,
      size,
      font: fonts.regular,
      color,
    })
    y -= size + 4
  }
  return y
}

function drawSignatureSection(page: PDFPage, fonts: Fonts, holderName: string, baseY: number) {
  const leftX = MARGIN + 72
  const rightX = PAGE_WIDTH - MARGIN - 72
  const lineWidth = 220

  page.drawLine({
    start: { x: leftX, y: baseY },
    end: { x: leftX + lineWidth, y: baseY },
    thickness: 1,
    color: rgb(0.35, 0.35, 0.35),
  })
  page.drawLine({
    start: { x: rightX - lineWidth, y: baseY },
    end: { x: rightX, y: baseY },
    thickness: 1,
    color: rgb(0.35, 0.35, 0.35),
  })

  const leftTitle = BRAND_NAME
  const leftSubtitle = 'Direção Acadêmica'
  const rightTitle = holderName
  const rightSubtitle = 'Aluno(a)'

  drawAlignedText(page, fonts.bold, leftTitle, leftX, baseY - 16, 11, 'left', rgb(0.1, 0.1, 0.1))
  drawAlignedText(page, fonts.regular, leftSubtitle, leftX, baseY - 30, 9, 'left', rgb(0.35, 0.35, 0.35))

  drawAlignedText(page, fonts.bold, rightTitle, rightX, baseY - 16, 11, 'right', rgb(0.1, 0.1, 0.1))
  drawAlignedText(page, fonts.regular, rightSubtitle, rightX, baseY - 30, 9, 'right', rgb(0.35, 0.35, 0.35))

  const signatureLabel = 'Assinatura'
  page.drawText(signatureLabel, {
    x: leftX + lineWidth / 2 - fonts.oblique.widthOfTextAtSize(signatureLabel, 10) / 2,
    y: baseY + 6,
    size: 10,
    font: fonts.oblique,
    color: rgb(0.45, 0.45, 0.45),
  })
}

function drawAlignedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  anchorX: number,
  y: number,
  size: number,
  align: 'left' | 'right',
  color: ReturnType<typeof rgb>
) {
  const width = font.widthOfTextAtSize(text, size)
  page.drawText(text, {
    x: align === 'left' ? anchorX : anchorX - width,
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
