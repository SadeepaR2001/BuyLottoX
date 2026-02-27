import { useEffect } from 'react'
import { Badge } from '../../components/ui/Badge'
import { useDrawsStore } from '../../features/draws/draws.store'
import { formatDateTime } from '../../utils/date'

export default function Draws() {
  const { list, fetchList, loading, error } = useDrawsStore()

  useEffect(() => { void fetchList() }, [fetchList])

  return (
    <div className="blx-panel p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Draws</h1>
        <div className="text-sm text-white/55">Mock list</div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      {loading && <p className="mt-3 text-sm text-white/55">Loading…</p>}

      <div className="mt-4 divide-y divide-white/10">
        {list.map((d) => (
          <div key={d.id} className="py-4 flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{d.title}</div>
              <div className="mt-1 text-xs text-white/40">{formatDateTime(d.drawAt)} • {d.id}</div>
            </div>
            <Badge tone={d.status === 'OPEN' ? 'green' : 'gray'}>{d.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
