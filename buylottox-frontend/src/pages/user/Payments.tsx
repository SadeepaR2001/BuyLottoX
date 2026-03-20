import { useEffect, useMemo, useState } from 'react'
import { usePaymentsStore } from '../../features/payments/payments.store'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime } from '../../utils/date'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatMoney } from '../../utils/money'

export default function Payments() {
  const { mine, fetchMine, uploadSlip, loading, error } = usePaymentsStore()
  const [files, setFiles] = useState<Record<number, File | undefined>>({})
  const [query, setQuery] = useState('')

  useEffect(() => { void fetchMine() }, [fetchMine])

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return mine
    return mine.filter((p) => `${p.ticketCode ?? ''} ${p.referenceNo ?? ''} ${p.status}`.toLowerCase().includes(q))
  }, [mine, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Payments</h1>
          <p className="text-sm text-white/55">Track your payment records and upload slips</p>
        </div>
        <div className="w-full md:w-80"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search payments…" /></div>
      </div>

      <div className="blx-panel p-4">
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {rows.length === 0 && !loading ? <p className="text-sm text-white/55">No payments found.</p> : null}
        <div className="divide-y divide-white/10">
          {rows.map((p) => (
            <div key={p.id} className="py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-medium">{p.ticketCode ?? `Payment #${p.id}`}</div>
                  <div className="mt-1 text-xs text-white/40">{formatDateTime(p.createdAt)}</div>
                  <div className="mt-2 text-sm text-white/60">Method: {p.method.replaceAll('_', ' ')}</div>
                  {p.referenceNo && <div className="text-sm text-white/60">Reference: {p.referenceNo}</div>}
                  {p.adminNotes && <div className="mt-2 text-sm text-amber-200">Admin note: {p.adminNotes}</div>}
                </div>
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <div className="font-semibold">{formatMoney(p.amount)}</div>
                  <Badge tone={p.status === 'APPROVED' ? 'green' : p.status === 'REJECTED' ? 'red' : 'yellow'}>{p.status}</Badge>
                </div>
              </div>
              {p.status !== 'APPROVED' && (
                <div className="mt-4 flex flex-col gap-3 md:flex-row">
                  <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, [p.id]: e.target.files?.[0] }))} />
                  <Button disabled={!files[p.id] || loading} onClick={() => files[p.id] && void uploadSlip(p.id, files[p.id] as File)}>
                    Upload Slip
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
