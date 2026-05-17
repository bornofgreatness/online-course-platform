import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth/admin'
import { getPrisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

function csvEscape(value: string | null | undefined): string {
  const s = value ?? ''
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/** Export registered users as leads (CSV) for marketing / WhatsApp campaigns. */
export async function GET() {
  try {
    await requireAdmin()
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const prisma = getPrisma()
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      email: true,
      whatsapp: true,
      address: true,
      city: true,
      state: true,
      createdAt: true,
    },
  })

  const header = ['nome', 'email', 'whatsapp', 'endereco', 'cidade', 'estado', 'cadastro_em']
  const rows = users.map((u) =>
    [
      csvEscape(u.name),
      csvEscape(u.email),
      csvEscape(u.whatsapp),
      csvEscape(u.address),
      csvEscape(u.city),
      csvEscape(u.state),
      csvEscape(u.createdAt.toISOString()),
    ].join(',')
  )

  const csv = [header.join(','), ...rows].join('\n')
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
