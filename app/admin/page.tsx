import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/options'
import { canAccessAdminPanel } from '../../lib/auth/rbac'
import dynamic from 'next/dynamic'
import PageLoading from '../../components/PageLoading'

const AdminCrudPage = dynamic(() => import('./admin-crud/page').then((m) => m.default), {
  ssr: false,
  loading: () => <PageLoading />,
})

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (!session || !canAccessAdminPanel(role)) {
    redirect('/')
  }

  return <AdminCrudPage />
}



