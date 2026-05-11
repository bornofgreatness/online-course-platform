import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/options'

import Header from '../../components/Header'
import dynamic from 'next/dynamic'

const AdminCrudPage = dynamic(() => import('./admin-crud/page').then((m) => m.default), { ssr: false })


export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role

  if (!session || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    redirect('/')
  }

  return (
    <>
      <AdminCrudPage />
    </>
  )
}



