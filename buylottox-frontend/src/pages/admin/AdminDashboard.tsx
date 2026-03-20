import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAdminStore } from '../../features/admin/admin.store'
import { usePaymentsStore } from '../../features/payments/payments.store'
import { formatMoney } from '../../utils/money'

export default function AdminDashboard() {
  const { users, fetchUsers } = useAdminStore()
  const { all, fetchAll } = usePaymentsStore()

  useEffect(() => {
    void fetchUsers()
    void fetchAll()
  }, [fetchUsers, fetchAll])

  const pendingCount = useMemo(() => all.filter((p) => p.status === 'PENDING' || p.status === 'SLIP_UPLOADED').length, [all])
  const approvedAmount = useMemo(() => all.filter((p) => p.status === 'APPROVED').reduce((sum, p) => sum + p.amount, 0), [all])

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="blx-panel p-6"><div className="text-xs text-white/50">Users</div><div className="mt-2 text-3xl font-semibold">{users.length}</div></div>
      <div className="blx-panel p-6"><div className="text-xs text-white/50">Pending Reviews</div><div className="mt-2 text-3xl font-semibold">{pendingCount}</div></div>
      <div className="blx-panel p-6"><div className="text-xs text-white/50">Approved Amount</div><div className="mt-2 text-3xl font-semibold">{formatMoney(approvedAmount)}</div></div>
      <div className="blx-panel p-6"><div className="text-xs text-white/50">Quick action</div><Link to="/admin/payments" className="mt-2 inline-block text-lg font-semibold text-purple-300">Open payment review →</Link></div>

      <div className="blx-panel p-6 md:col-span-2 xl:col-span-4">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-white/55">Manage users, tickets, draws, payments, and uploaded slips.</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/admin/users"><Button>Users</Button></Link>
          <Link to="/admin/payments"><Button variant="secondary">Payment Review</Button></Link>
          <Link to="/admin/draws"><Button variant="secondary">Draws</Button></Link>
        </div>
      </div>
    </div>
  )
}
