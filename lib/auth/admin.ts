import { getServerSession } from 'next-auth'
import { authOptions } from '../../app/api/auth/[...nextauth]/options'

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  const role = (session?.user as any)?.role as AdminRole | undefined
  if (!role || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    const err: any = new Error('Forbidden')
    err.statusCode = 403
    throw err
  }

  return { session, role }
}

