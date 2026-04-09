import { useEffect, useState } from 'react'
import { useAuthStore } from '../../features/auth/auth.store'
import { apiGet } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import { Card } from '../../components/ui/Card'
import { formatMoney } from '../../utils/money'
import { Link } from 'react-router-dom'

type ActiveGrid = {
  id: string
  title: string
  subTicketPrice: number
  winningPool: number
  status: string
  subTicketsPerMain: number
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [grid, setGrid] = useState<ActiveGrid | null>(null)

  useEffect(() => {
    void (async () => {
      const res = await apiGet<ActiveGrid | null>(endpoints.grid.active)
      if (res.ok) setGrid(res.data)
    })()
  }, [])

  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <Card><div className="text-xs text-white/50">Role</div><div className="mt-2 text-2xl font-semibold">{user.role}</div></Card>
        <Card><div className="text-xs text-white/50">Grid management</div><Link to="/admin/grids" className="mt-2 inline-block text-lg font-semibold text-purple-300">Manage grids →</Link></Card>
        <Card><div className="text-xs text-white/50">Users</div><Link to="/admin/users" className="mt-2 inline-block text-lg font-semibold text-purple-300">Manage users →</Link></Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <div className="text-xs text-white/50">Active grid</div>
        <div className="mt-2 text-2xl font-semibold">{grid?.title || 'No active grid'}</div>
      </Card>
      <Card>
        <div className="text-xs text-white/50">Winning pool</div>
        <div className="mt-2 text-2xl font-semibold">{grid ? formatMoney(grid.winningPool) : '—'}</div>
      </Card>
      <Card>
        <div className="text-xs text-white/50">Quick action</div>
        <Link to="/buy-ticket" className="mt-2 inline-block text-lg font-semibold text-purple-300">Buy tickets →</Link>
      </Card>
    </div>
  )
}
