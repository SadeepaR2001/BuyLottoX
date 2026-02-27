import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { useTicketsStore } from '../../features/tickets/tickets.store'
import { formatDateTime } from '../../utils/date'
import { Input } from '../../components/ui/Input'

export default function MyTickets() {
  const { items, fetchMine, loading, error } = useTicketsStore()
  const [q, setQ] = useState('')

  useEffect(() => { void fetchMine() }, [fetchMine])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter(t => t.id.toLowerCase().includes(s) || t.numbers.join('-').includes(s))
  }, [items, q])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Tickets</h1>
          <p className="text-sm text-white/55">{filtered.length} tickets</p>
        </div>
        <div className="w-full md:w-72">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ticket id or numbers…" />
        </div>
      </div>

      <div className="blx-panel p-4">
        {error && <p className="mt-1 text-sm text-rose-300">{error}</p>}
        {loading && <p className="mt-1 text-sm text-white/55">Loading…</p>}

        {!loading && filtered.length === 0 ? (
          <p className="p-3 text-sm text-white/55">No tickets found.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((t) => (
              <div key={t.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    {t.numbers.map((n) => (
                      <span key={n} className="blx-chip">{n}</span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-white/40">{formatDateTime(t.createdAt)} • {t.id}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge tone={t.status === 'WON' ? 'green' : t.status === 'LOST' ? 'red' : 'yellow'}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
