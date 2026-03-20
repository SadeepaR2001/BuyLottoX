import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { useTicketsStore } from '../../features/tickets/tickets.store'
import { usePaymentsStore } from '../../features/payments/payments.store'
import { formatDateTime } from '../../utils/date'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatMoney } from '../../utils/money'

export default function MyTickets() {
  const { items, fetchMine, loading, error } = useTicketsStore()
  const { createPayment, uploadSlip, loading: paymentLoading } = usePaymentsStore()
  const [q, setQ] = useState('')
  const [referenceNo, setReferenceNo] = useState<Record<number, string>>({})
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | undefined>>({})
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => { void fetchMine() }, [fetchMine])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter(t => t.ticketCode.toLowerCase().includes(s) || t.numbers.join('-').includes(s))
  }, [items, q])

  const makePayment = async (ticketId: number, amount: number) => {
    setMessage(null)
    const payment = await createPayment({
      ticketId,
      amount,
      method: 'BANK_TRANSFER',
      referenceNo: referenceNo[ticketId] || undefined,
    })
    if (!payment) return

    const file = selectedFiles[ticketId]
    if (file) {
      const ok = await uploadSlip(payment.id, file)
      setMessage(ok ? 'Payment created and slip uploaded.' : 'Payment created, but slip upload failed.')
    } else {
      setMessage('Payment created. You can upload the slip later from the Payments page.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Tickets</h1>
          <p className="text-sm text-white/55">{filtered.length} tickets</p>
        </div>
        <div className="w-full md:w-72">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ticket code or numbers…" />
        </div>
      </div>

      {message && <div className="blx-panel p-4 text-sm text-emerald-300">{message}</div>}

      <div className="blx-panel p-4">
        {error && <p className="mt-1 text-sm text-rose-300">{error}</p>}
        {loading && <p className="mt-1 text-sm text-white/55">Loading…</p>}

        {!loading && filtered.length === 0 ? (
          <p className="p-3 text-sm text-white/55">No tickets found.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((t) => (
              <div key={t.id} className="py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">{t.numbers.map((n) => <span key={n} className="blx-chip">{n}</span>)}</div>
                    <div className="mt-2 text-xs text-white/40">{formatDateTime(t.createdAt)} • {t.ticketCode}</div>
                    <div className="mt-1 text-xs text-white/40">{t.drawTitle}</div>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <Badge tone={t.status === 'CONFIRMED' || t.status === 'WON' ? 'green' : t.status === 'REJECTED' || t.status === 'LOST' ? 'red' : 'yellow'}>{t.status}</Badge>
                    <div className="text-sm text-white/60">Price: {formatMoney(t.ticketPrice ?? 0)}</div>
                  </div>
                </div>

                {t.status === 'PENDING_PAYMENT' && (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_auto]">
                    <Input
                      placeholder="Reference number (optional)"
                      value={referenceNo[t.id] || ''}
                      onChange={(e) => setReferenceNo((prev) => ({ ...prev, [t.id]: e.target.value }))}
                    />
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setSelectedFiles((prev) => ({ ...prev, [t.id]: e.target.files?.[0] }))}
                    />
                    <Button disabled={paymentLoading} onClick={() => void makePayment(t.id, t.ticketPrice ?? 0)}>
                      {paymentLoading ? 'Submitting…' : 'Pay Now'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
