import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { BRAND_NAME } from './certificatePolicy'

export type CertificatePdfData = {
  holderName: string
  courseTitle: string
  workloadHours: number
  certificateNumber: string
  issuedAt: Date
  holderEmail?: string | null
}

export async function buildCertificatePdf(data: CertificatePdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const margin = 56
  const centerX = 306
  let y = 700

  const hours = data.workloadHours || 100
  const issuedDate = data.issuedAt.toLocaleDateString('pt-BR')

  const drawCentered = (text: string, size: number, bold = false, color = rgb(0.1, 0.1, 0.1)) => {
    const f = bold ? fontBold : font
    const width = f.widthOfTextAtSize(text, size)
    page.drawText(text, { x: centerX - width / 2, y, size, font: f, color })
    y -= size + 10
  }

  drawCentered(BRAND_NAME, 16, true, rgb(0.05, 0.45, 0.42))
  y -= 8
  drawCentered('Certificado de Conclusao', 24, true, rgb(0.1, 0.15, 0.35))
  y -= 12
  drawCentered('Certificamos que', 13, false, rgb(0.35, 0.35, 0.35))
  y -= 4
  drawCentered(data.holderName, 20, true, rgb(0.05, 0.2, 0.45))
  y -= 8
  drawCentered('concluiu com exito o curso', 13, false, rgb(0.35, 0.35, 0.35))
  y -= 4

  const titleLines = wrapText(data.courseTitle, fontBold, 18, 480)
  for (const line of titleLines) {
    drawCentered(line, 18, true, rgb(0.1, 0.1, 0.1))
  }

  y -= 4
  drawCentered(`Carga horaria: ${hours} horas`, 14, false, rgb(0.3, 0.3, 0.3))
  y -= 24

  page.drawLine({
    start: { x: margin + 80, y },
    end: { x: 612 - margin - 80, y },
    thickness: 1,
    color: rgb(0.75, 0.75, 0.75),
  })
  y -= 28

  const footerSize = 11
  const codeText = `Codigo de verificacao: ${data.certificateNumber}`
  page.drawText(codeText, {
    x: centerX - font.widthOfTextAtSize(codeText, footerSize) / 2,
    y,
    size: footerSize,
    font,
    color: rgb(0.35, 0.35, 0.35),
  })
  y -= 18

  const dateText = `Data de emissao: ${issuedDate}`
  page.drawText(dateText, {
    x: centerX - font.widthOfTextAtSize(dateText, footerSize) / 2,
    y,
    size: footerSize,
    font,
    color: rgb(0.35, 0.35, 0.35),
  })

  if (data.holderEmail) {
    y -= 18
    const emailText = data.holderEmail
    page.drawText(emailText, {
      x: centerX - font.widthOfTextAtSize(emailText, 10) / 2,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
  }

  return pdfDoc.save()
}

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, size: number, maxWidth: number) {
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
