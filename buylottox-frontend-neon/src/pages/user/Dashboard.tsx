import { useEffect } from 'react'
import { useAuthStore } from '../../features/auth/auth.store'
import { useDrawsStore } from '../../features/draws/draws.store'
import { useTicketsStore } from '../../features/tickets/tickets.store'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime } from '../../utils/date'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { active, fetchActive } = useDrawsStore()
  const { items, fetchMine } = useTicketsStore()

  useEffect(() => {
    void fetchActive()
    void fetchMine()
  }, [fetchActive, fetchMine])

  return (
    <div className="grid gap-6">
      <div className="blx-panel-strong overflow-hidden">
        <div className="relative p-6 lg:p-7">
          <div className="absolute inset-0 bg-panel-sparkle opacity-70" />
          <div className="relative">
            <div className="text-sm text-white/55">Welcome{user ? `, ${user.name}` : ''}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome to BuyLottoX!</h1>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 blx-panel p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/60">Active Draw</div>
                    <div className="mt-1 text-3xl font-bold tracking-tight">$5,000,000</div>
                    <div className="mt-2 text-xs text-white/45">
                      {active ? `Draw at ${formatDateTime(active.drawAt)}` : 'Loading draw…'}
                    </div>
                  </div>
                  <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/25 bg-purple-500/10 shadow-neon lg:flex">
                    <div className="h-10 w-10 rounded-full border-2 border-purple-300/60" />
                  </div>
                </div>

                <div className="mt-4">
                  <Link to="/buy-ticket">
                    <Button>Buy Ticket</Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="blx-panel p-5">
                  <div className="text-xs text-white/50">Total Tickets</div>
                  <div className="mt-2 text-2xl font-semibold">{items.length}</div>
                </div>
                <div className="blx-panel p-5">
                  <div className="text-xs text-white/50">Account</div>
                  <div className="mt-2"><Badge tone="purple">{user?.role ?? 'USER'}</Badge></div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Tickets</h2>
                <Link className="text-sm text-purple-300 hover:text-purple-200" to="/my-tickets">
                  See all →
                </Link>
              </div>

              {items.length === 0 ? (
                <p className="mt-3 text-sm text-white/55">No tickets yet. Buy your first ticket.</p>
              ) : (
                <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {items.slice(0, 6).map((t) => (
                    <div key={t.id} className="blx-panel p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/40">{t.id}</div>
                        <Badge tone="yellow">{t.status}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.numbers.map((n) => (
                          <span key={n} className="blx-chip">{n}</span>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-white/40">{formatDateTime(t.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
