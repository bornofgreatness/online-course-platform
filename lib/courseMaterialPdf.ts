import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export const GENERATED_COURSE_PDF_URL = 'generated:course-material'

type CourseMaterial = {
  title: string
  description: string
  workloadHours: number | null
  syllabus: string | null
  category?: { name: string } | null
  subcategory?: { name: string } | null
}

function toPdfText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, '-')
}

function wrapText(text: string, maxChars: number): string[] {
  const words = toPdfText(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

export async function buildCourseMaterialPdf(course: CourseMaterial): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([612, 792])
  let y = 724
  const margin = 54
  const lineHeight = 16

  const newPageIfNeeded = () => {
    if (y > 84) return
    page = pdfDoc.addPage([612, 792])
    y = 724
  }

  const drawLine = (text: string, opts: { size?: number; isBold?: boolean; color?: ReturnType<typeof rgb> } = {}) => {
    newPageIfNeeded()
    page.drawText(toPdfText(text), {
      x: margin,
      y,
      size: opts.size ?? 11,
      font: opts.isBold ? bold : font,
      color: opts.color ?? rgb(0.18, 0.2, 0.24),
      maxWidth: 500,
    })
    y -= lineHeight
  }

  page.drawText('Course Material', {
    x: margin,
    y,
    size: 12,
    font: bold,
    color: rgb(0.1, 0.42, 0.72),
  })
  y -= 28

  for (const line of wrapText(course.title, 46)) {
    drawLine(line, { size: 20, isBold: true, color: rgb(0.05, 0.1, 0.25) })
  }
  y -= 8

  drawLine(`Category: ${course.category?.name ?? 'Course catalog'}`, { isBold: true })
  if (course.subcategory?.name) drawLine(`Topic: ${course.subcategory.name}`)
  drawLine(`Workload: ${course.workloadHours || 100} hours`)
  y -= 14

  drawLine('Overview', { size: 14, isBold: true, color: rgb(0.05, 0.1, 0.25) })
  for (const line of wrapText(course.description, 82)) drawLine(line)
  y -= 14

  drawLine('Study Plan', { size: 14, isBold: true, color: rgb(0.05, 0.1, 0.25) })
  const syllabusLines = (course.syllabus || 'Module 1: Fundamentals\nModule 2: Practice\nModule 3: Review and certificate')
    .split('\n')
    .flatMap((line) => wrapText(line, 82))

  for (const line of syllabusLines) drawLine(line)
  y -= 14

  drawLine('Certificate Requirements', { size: 14, isBold: true, color: rgb(0.05, 0.1, 0.25) })
  drawLine('- Read the course material through the protected viewer.')
  drawLine('- Complete the course progress.')
  drawLine('- Pass the quiz with at least 7 correct answers out of 10 when assigned.')
  drawLine('- Generate your certificate from the student dashboard or course page.')

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
