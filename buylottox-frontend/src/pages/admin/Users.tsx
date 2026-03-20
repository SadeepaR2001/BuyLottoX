import { useEffect, useMemo, useState } from 'react'
import { useAdminStore } from '../../features/admin/admin.store'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatDateTime } from '../../utils/date'
import { Badge } from '../../components/ui/Badge'
import { formatMoney } from '../../utils/money'

export default function Users() {
  const { users, selectedHistory, fetchUsers, fetchUserHistory, clearSelectedHistory, loading, error } = useAdminStore()
  const [query, setQuery] = useState('')

  useEffect(() => {
    void fetchUsers()
    return () => clearSelectedHistory()
  }, [fetchUsers, clearSelectedHistory])

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return users
    return users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q))
  }, [users, query])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
      <div className="blx-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Users</h1>
            <p className="text-sm text-white/55">Check user history and ticket/payment activity</p>
          </div>
          <div className="w-72"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" /></div>
        </div>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        <div className="mt-4 divide-y divide-white/10">
          {rows.map((u) => (
            <div key={u.id} className="py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="mt-1 text-sm text-white/55">{u.email}</div>
                <div className="mt-1 text-xs text-white/40">Joined {formatDateTime(u.createdAt)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={u.role === 'ADMIN' ? 'purple' : 'gray'}>{u.role}</Badge>
                <span className="text-xs text-white/50">Tickets: {u.ticketCount}</span>
                <span className="text-xs text-white/50">Payments: {u.paymentCount}</span>
                <span className="text-xs text-white/50">Approved: {formatMoney(u.approvedPaymentTotal)}</span>
                <Button variant="secondary" onClick={() => void fetchUserHistory(u.id)} disabled={loading}>View History</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="blx-panel p-6">
        <h2 className="text-lg font-semibold">User History</h2>
        {!selectedHistory ? (
          <p className="mt-3 text-sm text-white/55">Select a user to load ticket and payment history.</p>
        ) : (
          <div className="mt-4 space-y-6">
            <div>
              <div className="text-lg font-medium">{selectedHistory.user.name}</div>
              <div className="text-sm text-white/55">{selectedHistory.user.email}</div>
            </div>

            <div>
              <h3 className="font-medium">Tickets</h3>
              <div className="mt-3 space-y-3">
                {selectedHistory.tickets.length === 0 ? <p className="text-sm text-white/55">No tickets yet.</p> : selectedHistory.tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{ticket.ticketCode}</div>
                        <div className="text-xs text-white/45">{ticket.drawTitle}</div>
                      </div>
                      <Badge tone="yellow">{ticket.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Payments</h3>
              <div className="mt-3 space-y-3">
                {selectedHistory.payments.length === 0 ? <p className="text-sm text-white/55">No payments yet.</p> : selectedHistory.payments.map((payment) => (
                  <div key={payment.id} className="rounded-xl border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{payment.ticketCode ?? `Payment #${payment.id}`}</div>
                        <div className="text-xs text-white/45">{formatMoney(payment.amount)} • {payment.method.replaceAll('_', ' ')}</div>
                      </div>
                      <Badge tone={payment.status === 'APPROVED' ? 'green' : payment.status === 'REJECTED' ? 'red' : 'yellow'}>{payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
