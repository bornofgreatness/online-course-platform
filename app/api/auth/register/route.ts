import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 })
  }

  const prisma = getPrisma()

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
}