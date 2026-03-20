import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { useDrawsStore } from '../../features/draws/draws.store'
import { formatDateTime } from '../../utils/date'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatMoney } from '../../utils/money'

export default function Draws() {
  const { list, fetchList, loading, error, createDraw, closeDraw } = useDrawsStore()
  const [title, setTitle] = useState('Weekly Mega Draw')
  const [drawAt, setDrawAt] = useState('')
  const [ticketPrice, setTicketPrice] = useState('5')
  const [jackpotAmount, setJackpotAmount] = useState('5000000')

  useEffect(() => { void fetchList() }, [fetchList])

  const submit = async () => {
    if (!title || !drawAt) return
    const ok = await createDraw({
      title,
      drawAt: new Date(drawAt).toISOString().slice(0, 19).replace('T', ' '),
      ticketPrice: Number(ticketPrice),
      jackpotAmount: Number(jackpotAmount),
    })
    if (ok) {
      setTitle('Weekly Mega Draw')
      setDrawAt('')
      setTicketPrice('5')
      setJackpotAmount('5000000')
      void fetchList()
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <div className="blx-panel p-6">
        <h2 className="text-lg font-semibold">Create Draw</h2>
        <div className="mt-4 space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Draw title" />
          <Input type="datetime-local" value={drawAt} onChange={(e) => setDrawAt(e.target.value)} />
          <Input type="number" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} placeholder="Ticket price" />
          <Input type="number" value={jackpotAmount} onChange={(e) => setJackpotAmount(e.target.value)} placeholder="Jackpot amount" />
          <Button className="w-full" onClick={() => void submit()} disabled={loading}>Create Draw</Button>
        </div>
      </div>

      <div className="blx-panel p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Draws</h1>
          <div className="text-sm text-white/55">Manage open and closed draws</div>
        </div>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        {loading && <p className="mt-3 text-sm text-white/55">Loading…</p>}

        <div className="mt-4 divide-y divide-white/10">
          {list.map((d) => (
            <div key={d.id} className="py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="mt-1 text-xs text-white/40">{formatDateTime(d.drawAt)} • #{d.id}</div>
                <div className="mt-1 text-xs text-white/40">Price: {formatMoney(d.ticketPrice)} • Jackpot: {formatMoney(d.jackpotAmount)}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={d.status === 'OPEN' ? 'green' : 'gray'}>{d.status}</Badge>
                {d.status === 'OPEN' && <Button variant="secondary" onClick={() => void closeDraw(d.id)}>Close Draw</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
