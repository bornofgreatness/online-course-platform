/** Resend email helper (verification, password reset, campaigns). */

export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY não configurada' }
  }

  const from = opts.from || process.env.RESEND_FROM_EMAIL || 'Plataforma <onboarding@resend.dev>'
  const to = Array.isArray(opts.to) ? opts.to : [opts.to]

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: opts.subject,
      html: opts.html,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false, error: `Resend ${res.status}: ${text}` }
  }

  return { ok: true }
}
