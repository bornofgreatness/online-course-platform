import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/options'
import Header from '../../../components/Header'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'


const ClientAdminCrud = dynamic(() => import('./ClientAdminCrud'), { ssr: false })

export default async function AdminCrudPage() {
  const session = await getServerSession(authOptions)

  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    redirect('/')
  }

  return (
    <>
      <Header />
      <ClientAdminCrud />
    </>
  )


}

