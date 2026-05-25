import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { usePaymentsStore } from '../../features/payments/payments.store'
import type { Payment } from '../../features/payments/payments.types'
import { formatDateTime } from '../../utils/date'
import { formatMoney } from '../../utils/money'

function titleFor(payment: Payment) {
  if (payment.rafflePurchase) return `Raffle: ${payment.rafflePurchase.raffle?.title ?? 'Raffle Draw'}`
  return `Grid: ${payment.purchase?.grid?.title ?? '—'}`
}

function ticketsFor(payment: Payment) {
  if (payment.rafflePurchase) return payment.rafflePurchase.tickets.map((ticket) => `Raffle #${ticket.number}`).join(', ') || '—'
  return payment.purchase?.subTickets.map((sub) => `${sub.gridNumber?.number}-${sub.subIndex}`).join(', ') || '—'
}

export default function AdminPayments() {
  const { all, fetchAll, approvePayment, rejectPayment, loading, error } = usePaymentsStore()
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => { void fetchAll() }, [fetchAll])

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return all
    return all.filter((payment) => {
      const haystack = [
        payment.reference,
        payment.user?.name,
        payment.user?.mobileNumber,
        payment.purchase?.grid?.title,
        payment.rafflePurchase?.raffle?.title,
        payment.status,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [all, query])

  const toneForStatus = (status: string) => {
    if (status === 'COMPLETED' || status === 'APPROVED') return 'green'
    if (status === 'REJECTED') return 'red'
    return 'yellow'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manual Payment Review</h1>
          <p className="text-sm text-white/55">Review uploaded slips and approve or reject grid and raffle ticket bookings.</p>
        </div>
        <div className="w-full md:w-80"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payments…" /></div>
      </div>

      <div className="blx-panel p-6">
        {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
        <div className="space-y-4">
          {rows.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-white/10 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="text-lg font-semibold">{payment.reference}</div>
                  <div className="text-sm text-white/70">User: {payment.user?.name} ({payment.user?.mobileNumber})</div>
                  <div className="text-sm text-white/70">Type: {payment.rafflePurchase ? 'Raffle Ticket' : 'Grid Ticket'}</div>
                  <div className="text-sm text-white/70">{titleFor(payment)}</div>
                  <div className="text-sm text-white/70">Purchase ID: {payment.purchaseId || payment.rafflePurchaseId}</div>
                  <div className="text-sm text-white/70">Expected amount: {formatMoney(payment.amount)}</div>
                  <div className="text-sm text-white/70">Created at: {formatDateTime(payment.createdAt)}</div>
                  <div className="text-sm text-white/70">Selected tickets: {ticketsFor(payment)}</div>
                  <div className="text-sm text-white/70">
                    Slip: {payment.slipPath ? <a className="text-purple-300 underline" href={`${import.meta.env.VITE_API_URL}${payment.slipPath}`} target="_blank" rel="noreferrer">Open slip</a> : 'Not uploaded yet'}
                  </div>
                </div>

                <div className="flex min-w-52 flex-col items-start gap-2 xl:items-end">
                  <Badge tone={toneForStatus(payment.status) as any}>{payment.status}</Badge>
                  {payment.rejectionReason && <div className="text-sm text-rose-300">Reason: {payment.rejectionReason}</div>}
                  {payment.adminNote && <div className="text-sm text-amber-200">Note: {payment.adminNote}</div>}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <Input placeholder="Admin note / rejection reason" value={notes[payment.id] || ''} onChange={(e) => setNotes((prev) => ({ ...prev, [payment.id]: e.target.value }))} />
                <Button disabled={loading || payment.status === 'COMPLETED'} onClick={() => void approvePayment(payment.id, notes[payment.id])}>Approve</Button>
                <Button variant="secondary" disabled={loading || payment.status === 'REJECTED'} onClick={() => void rejectPayment(payment.id, notes[payment.id])}>Reject</Button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="text-sm text-white/50">No payments found.</div>}
        </div>
      </div>
    </div>
  )
}
