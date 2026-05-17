import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../../lib/auth/admin'
import { getPrisma } from '../../../../../../lib/prisma'
import { sendEmail } from '../../../../../../lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }

  const prisma = getPrisma()
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: params.id } })
  if (!campaign) {
    return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  }
  if (campaign.status === 'sent') {
    return NextResponse.json({ error: 'Campanha já enviada' }, { status: 400 })
  }

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: { status: 'sending' },
  })

  const where =
    campaign.recipientFilter === 'verified_students'
      ? { role: 'STUDENT', emailVerifiedAt: { not: null } }
      : campaign.recipientFilter === 'all_leads'
        ? { role: 'STUDENT' }
        : { role: 'STUDENT' }

  const users = await prisma.user.findMany({
    where,
    select: { email: true, name: true },
  })

  let sent = 0
  const errors: string[] = []

  for (const user of users) {
    const html = campaign.bodyHtml
      .replace(/\{\{nome\}\}/g, user.name)
      .replace(/\{\{email\}\}/g, user.email)

    const result = await sendEmail({
      to: user.email,
      subject: campaign.subject,
      html,
    })

    if (result.ok) {
      sent++
    } else {
      errors.push(`${user.email}: ${result.error}`)
      if (errors.length >= 5) break
    }
  }

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: {
      status: sent > 0 ? 'sent' : 'draft',
      sentCount: sent,
      sentAt: sent > 0 ? new Date() : null,
    },
  })

  return NextResponse.json({
    sent,
    total: users.length,
    errors: errors.slice(0, 5),
  })
}
