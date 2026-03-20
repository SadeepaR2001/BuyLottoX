import { useEffect, useMemo, useState } from 'react'
import { usePaymentsStore } from '../../features/payments/payments.store'
import { useTicketsStore } from '../../features/tickets/tickets.store'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatDateTime } from '../../utils/date'
import { formatMoney } from '../../utils/money'
import type { PaymentStatus } from '../../features/payments/payments.types'

export default function AdminPayments() {
  const { all, fetchAll, updatePaymentStatus, loading, error } = usePaymentsStore()
  const { updateTicketStatus } = useTicketsStore()
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState<Record<number, string>>({})

  useEffect(() => { void fetchAll() }, [fetchAll])

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return all
    return all.filter((p) => `${p.userName ?? ''} ${p.userEmail ?? ''} ${p.ticketCode ?? ''} ${p.status}`.toLowerCase().includes(q))
  }, [all, query])

  const review = async (paymentId: number, status: PaymentStatus, ticketId?: number | null) => {
    const ok = await updatePaymentStatus(paymentId, status, notes[paymentId])
    if (ok && ticketId) {
      if (status === 'APPROVED') await updateTicketStatus(ticketId, 'CONFIRMED', notes[paymentId])
      if (status === 'REJECTED') await updateTicketStatus(ticketId, 'REJECTED', notes[paymentId])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Payment Review</h1>
          <p className="text-sm text-white/55">Approve or reject payment history and uploaded slips</p>
        </div>
        <div className="w-full md:w-80"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payments…" /></div>
      </div>

      <div className="blx-panel p-4">
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="divide-y divide-white/10">
          {rows.map((p) => (
            <div key={p.id} className="py-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-sm font-medium">{p.userName} • {p.ticketCode ?? `Payment #${p.id}`}</div>
                  <div className="mt-1 text-xs text-white/40">{p.userEmail} • {formatDateTime(p.createdAt)}</div>
                  <div className="mt-2 text-sm text-white/60">Method: {p.method.replaceAll('_', ' ')} • Ref: {p.referenceNo || '—'}</div>
                  <div className="mt-1 text-sm text-white/60">Slip: {p.slipPath ? p.slipPath : 'Not uploaded yet'}</div>
                  {p.adminNotes && <div className="mt-2 text-sm text-amber-200">Current note: {p.adminNotes}</div>}
                </div>

                <div className="flex flex-col items-start gap-2 xl:items-end">
                  <div className="font-semibold">{formatMoney(p.amount)}</div>
                  <Badge tone={p.status === 'APPROVED' ? 'green' : p.status === 'REJECTED' ? 'red' : 'yellow'}>{p.status}</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <Input placeholder="Admin note" value={notes[p.id] || ''} onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))} />
                <Button disabled={loading} onClick={() => void review(p.id, 'APPROVED', p.ticketId)}>Approve</Button>
                <Button variant="secondary" disabled={loading} onClick={() => void review(p.id, 'REJECTED', p.ticketId)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
