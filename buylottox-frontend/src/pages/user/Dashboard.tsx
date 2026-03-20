import { useEffect, useMemo } from 'react'
import { useAuthStore } from '../../features/auth/auth.store'
import { useDrawsStore } from '../../features/draws/draws.store'
import { useTicketsStore } from '../../features/tickets/tickets.store'
import { usePaymentsStore } from '../../features/payments/payments.store'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime } from '../../utils/date'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { formatMoney } from '../../utils/money'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { active, fetchActive } = useDrawsStore()
  const { items, fetchMine } = useTicketsStore()
  const { mine, fetchMine: fetchPayments } = usePaymentsStore()

  useEffect(() => {
    void fetchActive()
    if (user?.role === 'USER') {
      void fetchMine()
      void fetchPayments()
    }
  }, [fetchActive, fetchMine, fetchPayments, user?.role])

  const recentApproved = useMemo(
    () => mine.filter((p) => p.status === 'APPROVED').reduce((sum, p) => sum + p.amount, 0),
    [mine],
  )

  if (user?.role === 'ADMIN') {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <div className="blx-panel p-6"><div className="text-xs text-white/50">Role</div><div className="mt-2 text-2xl font-semibold">ADMIN</div></div>
        <div className="blx-panel p-6"><div className="text-xs text-white/50">Quick action</div><Link to="/admin/payments" className="mt-2 inline-block text-lg font-semibold text-purple-300">Review payments →</Link></div>
        <div className="blx-panel p-6"><div className="text-xs text-white/50">Draw management</div><Link to="/admin/draws" className="mt-2 inline-block text-lg font-semibold text-purple-300">Manage draws →</Link></div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="blx-panel-strong overflow-hidden">
        <div className="relative p-6 lg:p-7">
          <div className="absolute inset-0 bg-panel-sparkle opacity-70" />
          <div className="relative">
            <div className="text-sm text-white/55">Welcome{user ? `, ${user.name}` : ''}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ready for the next draw?</h1>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 blx-panel p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/60">Active Draw</div>
                    <div className="mt-1 text-3xl font-bold tracking-tight">{active ? formatMoney(active.jackpotAmount) : '—'}</div>
                    <div className="mt-2 text-xs text-white/45">
                      {active ? `${active.title} • Draw at ${formatDateTime(active.drawAt)}` : 'No open draw currently'}
                    </div>
                  </div>
                  <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/25 bg-purple-500/10 shadow-neon lg:flex">
                    <div className="h-10 w-10 rounded-full border-2 border-purple-300/60" />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link to="/buy-ticket"><Button>Buy Ticket</Button></Link>
                  <Link to="/payments"><Button variant="secondary">Payments</Button></Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="blx-panel p-5">
                  <div className="text-xs text-white/50">Total Tickets</div>
                  <div className="mt-2 text-2xl font-semibold">{items.length}</div>
                </div>
                <div className="blx-panel p-5">
                  <div className="text-xs text-white/50">Approved Payments</div>
                  <div className="mt-2 text-2xl font-semibold">{formatMoney(recentApproved)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Tickets</h2>
                <Link className="text-sm text-purple-300 hover:text-purple-200" to="/my-tickets">See all →</Link>
              </div>

              {items.length === 0 ? (
                <p className="mt-3 text-sm text-white/55">No tickets yet. Buy your first ticket.</p>
              ) : (
                <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {items.slice(0, 6).map((t) => (
                    <div key={t.id} className="blx-panel p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/40">{t.ticketCode}</div>
                        <Badge tone="yellow">{t.status}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.numbers.map((n) => <span key={n} className="blx-chip">{n}</span>)}
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
