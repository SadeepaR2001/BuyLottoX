import { useEffect, useMemo, useState } from 'react'
import { adminService } from '../../features/admin/admin.service'
import type { AdminGrid, AdminUser } from '../../features/admin/admin.types'
import { Card } from '../../components/ui/Card'
import { formatMoney } from '../../utils/money'
import { formatDateTime } from '../../utils/date'

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [grids, setGrids] = useState<AdminGrid[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const [usersRes, gridsRes] = await Promise.all([adminService.listUsers(), adminService.listGrids()])
      if (usersRes.ok) setUsers(usersRes.data)
      if (gridsRes.ok) setGrids(gridsRes.data)
      if (!usersRes.ok) setError(usersRes.error)
      else if (!gridsRes.ok) setError(gridsRes.error)
    })()
  }, [])

  const summary = useMemo(() => {
    const blockedUsers = users.filter((u) => u.status === 'BLOCKED').length
    const admins = users.filter((u) => u.role === 'ADMIN').length
    const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN').length
    const openGrids = grids.filter((g) => g.status === 'OPEN').length
    const totalPool = grids.reduce((sum, g) => sum + g.winningPool, 0)
    return { blockedUsers, admins, superAdmins, openGrids, totalPool }
  }, [users, grids])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-white/55">Overview of users and timed ticket grids.</p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card><div className="text-xs text-white/50">Users</div><div className="mt-2 text-2xl font-semibold">{users.length}</div></Card>
        <Card><div className="text-xs text-white/50">Blocked Users</div><div className="mt-2 text-2xl font-semibold">{summary.blockedUsers}</div></Card>
        <Card><div className="text-xs text-white/50">Admins</div><div className="mt-2 text-2xl font-semibold">{summary.admins}</div></Card>
        <Card><div className="text-xs text-white/50">Super Admins</div><div className="mt-2 text-2xl font-semibold">{summary.superAdmins}</div></Card>
        <Card><div className="text-xs text-white/50">Open Grids</div><div className="mt-2 text-2xl font-semibold">{summary.openGrids}</div></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Recent Grids</h2>
          <div className="mt-4 space-y-3">
            {grids.slice(0, 5).map((grid) => (
              <div key={grid.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{grid.title}</div>
                    <div className="text-xs text-white/50">{formatDateTime(grid.openAt)} → {formatDateTime(grid.closeAt)}</div>
                  </div>
                  <div className="text-sm font-medium">{grid.status}</div>
                </div>
                <div className="mt-2 text-sm text-white/55">Winning pool {formatMoney(grid.winningPool)}</div>
              </div>
            ))}
            {grids.length === 0 && <p className="text-sm text-white/55">No grids created yet.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Revenue Snapshot</h2>
          <div className="mt-4 rounded-xl border border-white/10 p-4">
            <div className="text-xs text-white/50">Combined winning pool</div>
            <div className="mt-2 text-3xl font-semibold">{formatMoney(summary.totalPool)}</div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 p-4">
            <div className="text-xs text-white/50">Latest grid total value</div>
            <div className="mt-2 text-2xl font-semibold">{grids[0] ? formatMoney(grids[0].totalValue) : '—'}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
