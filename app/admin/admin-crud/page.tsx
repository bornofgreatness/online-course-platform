import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/options'
import Header from '../../../components/Header'
import PageShell from '../../../components/PageShell'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { canAccessAdminPanel } from '../../../lib/auth/rbac'

const ClientAdminCrud = dynamic(() => import('./ClientAdminCrud'), { ssr: false })

export default async function AdminCrudPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (!session || !canAccessAdminPanel(role)) {
    redirect('/')
  }

  return (
    <>
      <Header />
      <PageShell>
        <ClientAdminCrud />
      </PageShell>
    </>
  )
}

