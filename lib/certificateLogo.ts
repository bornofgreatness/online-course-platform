import fs from 'fs'
import path from 'path'

const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'certificate-template.jpg')
const PROCESSED_PATH = path.join(process.cwd(), 'public', 'logo-certificate.png')
const SOURCE_PATH = path.join(process.cwd(), 'public', 'logo.jpg')

/** Bump when processing changes so stale cache files are ignored. */
const LOGO_PROCESS_VERSION = 2

let cachedLogoPng: Uint8Array | null = null
let cachedPaperRgb: { r: number; g: number; b: number } | null = null

async function loadSharp() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  return require('sharp') as any
}

function readProcessedLogo(): Uint8Array | null {
  const metaPath = `${PROCESSED_PATH}.meta`
  if (!fs.existsSync(PROCESSED_PATH) || !fs.existsSync(metaPath)) return null
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as { version?: number }
    if (meta.version !== LOGO_PROCESS_VERSION) return null
    return new Uint8Array(fs.readFileSync(PROCESSED_PATH))
  } catch {
    return null
  }
}

function writeProcessedLogo(pngBuffer: Buffer) {
  try {
    fs.writeFileSync(PROCESSED_PATH, pngBuffer)
    fs.writeFileSync(`${PROCESSED_PATH}.meta`, JSON.stringify({ version: LOGO_PROCESS_VERSION }))
  } catch {
    // Ignore write errors on read-only deploys.
  }
}

/** Average background color from the certificate template (fallback when template image is missing). */
export async function getCertificatePaperRgb(): Promise<{ r: number; g: number; b: number }> {
  if (cachedPaperRgb) return cachedPaperRgb

  if (!fs.existsSync(TEMPLATE_PATH)) {
    cachedPaperRgb = { r: 255, g: 255, b: 255 }
    return cachedPaperRgb
  }

  try {
    const sharp = await loadSharp()
    const meta = await sharp(TEMPLATE_PATH).metadata()
    const width = meta.width ?? 1024
    const height = meta.height ?? 722
    const sampleWidth = Math.min(220, width)
    const sampleHeight = Math.min(Math.floor(height * 0.12), height)
    const left = Math.floor((width - sampleWidth) / 2)
    const top = Math.floor(height * 0.02)

    const { data, info } = await sharp(TEMPLATE_PATH)
      .extract({ left, top, width: sampleWidth, height: sampleHeight })
      .raw()
      .toBuffer({ resolveWithObject: true })

    let r = 0
    let g = 0
    let b = 0
    const channels = info.channels
    const pixels = data.length / channels
    for (let i = 0; i < data.length; i += channels) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }

    cachedPaperRgb = {
      r: Math.round(r / pixels),
      g: Math.round(g / pixels),
      b: Math.round(b / pixels),
    }
  } catch {
    cachedPaperRgb = { r: 255, g: 255, b: 255 }
  }

  return cachedPaperRgb
}

/** Make near-white JPG background transparent so the template shows through. */
function applyTransparentBackground(data: Buffer) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const minChannel = Math.min(r, g, b)
    const maxChannel = Math.max(r, g, b)
    const chroma = maxChannel - minChannel

    if (minChannel >= 248 && chroma <= 12) {
      data[i + 3] = 0
      continue
    }

    if (minChannel >= 215 && chroma <= 28) {
      const whiteness = (minChannel - 215) / 33
      const alpha = Math.round(255 * (1 - Math.min(1, whiteness)))
      data[i + 3] = Math.min(data[i + 3], alpha)
    }
  }
}

/** Logo PNG with transparent background for overlay on the certificate template. */
export async function getCertificateLogoPng(): Promise<Uint8Array | null> {
  if (cachedLogoPng) return cachedLogoPng

  const cached = readProcessedLogo()
  if (cached) {
    cachedLogoPng = cached
    return cachedLogoPng
  }

  if (!fs.existsSync(SOURCE_PATH)) return null

  const sharp = await loadSharp()

  const { data, info } = await sharp(SOURCE_PATH)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  applyTransparentBackground(data)

  const pngBuffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()

  cachedLogoPng = new Uint8Array(pngBuffer)
  writeProcessedLogo(pngBuffer)

  return cachedLogoPng
}
