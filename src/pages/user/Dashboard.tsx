import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/auth.store'
import { apiGet } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatDateTime } from '../../utils/date'
import { formatMoney } from '../../utils/money'

type ActiveGrid = {
  id: string
  title: string
  openAt: string
  closeAt: string
  subTicketPrice: number
  winningPool: number
  status: string
  subTicketsPerMain: number
  winningAmountPerSubTicket?: number
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [grids, setGrids] = useState<ActiveGrid[]>([])
  const [selectedGridId, setSelectedGridId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      const res = await apiGet<ActiveGrid[]>(endpoints.grid.active)
      setLoading(false)

      if (!res.ok) {
        setGrids([])
        setSelectedGridId('')
        setError(res.error)
        return
      }

      setGrids(res.data)
      setSelectedGridId((current) => {
        if (current && res.data.some((grid) => grid.id === current)) return current
        return res.data[0]?.id ?? ''
      })
    })()
  }, [])

  const selectedGrid = useMemo(
    () => grids.find((grid) => grid.id === selectedGridId) ?? grids[0] ?? null,
    [grids, selectedGridId],
  )

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-white/55">Select any open grid and continue to buy tickets from that grid.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/raffles"><Button>Raffle Draws</Button></Link>
          <Link to="/payments"><Button variant="secondary">Payment History / Previous Activity</Button></Link>
        </div>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <div className="text-xs text-white/50">Open grids</div>
          <div className="mt-2 text-2xl font-semibold">{loading ? 'Loading…' : grids.length}</div>
        </Card>
        <Card>
          <div className="text-xs text-white/50">Selected grid</div>
          <div className="mt-2 text-2xl font-semibold">{selectedGrid?.title || 'No open grid'}</div>
        </Card>
        <Card>
          <div className="text-xs text-white/50">Winning pool</div>
          <div className="mt-2 text-2xl font-semibold">{selectedGrid ? formatMoney(selectedGrid.winningPool) : '—'}</div>
        </Card>
      </div>

      <div className="blx-panel p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Choose Open Grid</h2>
            <p className="text-sm text-white/55">All admin-opened grids are listed here.</p>
          </div>
          <Badge tone={grids.length > 0 ? 'green' : 'red'}>{grids.length} OPEN</Badge>
        </div>

        {grids.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 p-4 text-sm text-white/55">No open grid is available right now.</div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {grids.map((grid) => {
              const selected = selectedGrid?.id === grid.id
              return (
                <div
                  key={grid.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedGridId(grid.id)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedGridId(grid.id) }}
                  className={[
                    'rounded-2xl border p-4 text-left transition',
                    selected ? 'border-purple-400/70 bg-purple-500/10 ring-2 ring-purple-400/30' : 'border-white/10 bg-black/20 hover:border-purple-400/40',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{grid.title}</div>
                      <div className="mt-1 text-xs text-white/50">{formatDateTime(grid.openAt)} → {formatDateTime(grid.closeAt)}</div>
                    </div>
                    <Badge tone="green">OPEN</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-white/60 sm:grid-cols-2">
                    <div>Price: {formatMoney(grid.subTicketPrice)}</div>
                    <div>Pool: {formatMoney(grid.winningPool)}</div>
                    <div>Sub/main: {grid.subTicketsPerMain}</div>
                    <div>Win each: {formatMoney(grid.winningAmountPerSubTicket ?? grid.winningPool / grid.subTicketsPerMain)}</div>
                  </div>
                  <Link
                    to={`/buy-ticket?gridId=${grid.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-4 inline-flex rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-400"
                  >
                    Buy from this grid
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to={selectedGrid ? `/buy-ticket?gridId=${selectedGrid.id}` : '/buy-ticket'}>
            <Button disabled={!selectedGrid}>Buy Tickets From Selected Grid</Button>
          </Link>
          <Link to="/payments"><Button variant="secondary">View Payment History / Previous Activity</Button></Link>
          <Link to="/raffles"><Button variant="secondary">View Raffle Draws</Button></Link>
        </div>
      </div>
    </div>
  )
}
