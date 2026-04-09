import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatMoney } from '../../utils/money'
import { formatDateTime } from '../../utils/date'

type ActiveGrid = {
  id: string
  title: string
  openAt: string
  closeAt: string
  subTicketPrice: number
  commissionRate: number
  totalValue: number
  commissionAmount: number
  winningPool: number
  winningNumber: number | null
  status: 'OPEN' | 'DRAFT' | 'CLOSED' | 'COMPLETED'
  totalMainNumbers: number
  subTicketsPerMain: number
  winningAmountPerSubTicket: number
}

type GridNumber = {
  id: string
  number: number
  isSoldOut: boolean
  soldCount: number
  remainingCount: number
}

type SubTicket = {
  id: string
  subIndex: number
  status: 'AVAILABLE' | 'SOLD'
  soldAt: string | null
}

export default function BuyTicket() {
  const [grid, setGrid] = useState<ActiveGrid | null>(null)
  const [numbers, setNumbers] = useState<GridNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [subTickets, setSubTickets] = useState<SubTicket[]>([])
  const [selections, setSelections] = useState<Record<number, number[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadGrid = async () => {
    setError(null)
    const activeRes = await apiGet<ActiveGrid | null>(endpoints.grid.active)
    if (!activeRes.ok) return setError(activeRes.error)
    setGrid(activeRes.data)
    if (!activeRes.data) return
    const numbersRes = await apiGet<GridNumber[]>(endpoints.grid.numbers(activeRes.data.id))
    if (!numbersRes.ok) return setError(numbersRes.error)
    setNumbers(numbersRes.data)
  }

  useEffect(() => {
    void loadGrid()
    const id = window.setInterval(() => { void loadGrid() }, 15000)
    return () => window.clearInterval(id)
  }, [])

  const loadSubTickets = async (number: number) => {
    if (!grid) return
    setSelectedNumber(number)
    setError(null)
    const res = await apiGet<{ number: number; subTickets: SubTicket[] }>(endpoints.grid.subTickets(grid.id, number))
    if (!res.ok) return setError(res.error)
    setSubTickets(res.data.subTickets)
  }

  const toggleSubTicket = (subIndex: number) => {
    if (selectedNumber === null) return
    setSelections((prev) => {
      const current = prev[selectedNumber] || []
      const next = current.includes(subIndex) ? current.filter((i) => i !== subIndex) : [...current, subIndex].sort((a, b) => a - b)
      return { ...prev, [selectedNumber]: next }
    })
  }

  const totalSelected = useMemo(() => Object.values(selections).reduce((sum, items) => sum + items.length, 0), [selections])
  const totalAmount = useMemo(() => (grid ? totalSelected * grid.subTicketPrice : 0), [grid, totalSelected])

  const buyTickets = async () => {
    if (!grid || totalSelected === 0) return
    setLoading(true)
    setError(null)
    setMessage(null)
    const payload = {
      selections: Object.entries(selections)
        .filter(([, subIndexes]) => subIndexes.length > 0)
        .map(([number, subIndexes]) => ({ number: Number(number), subIndexes })),
    }
    const res = await apiPost<{ message: string; totalAmount: number }>(endpoints.grid.buy(grid.id), payload)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    setMessage(res.data.message)
    setSelections({})
    setSelectedNumber(null)
    setSubTickets([])
    await loadGrid()
  }

  const now = new Date().getTime()
  const isOpen = grid ? now >= new Date(grid.openAt).getTime() && now <= new Date(grid.closeAt).getTime() && grid.status === 'OPEN' : false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Buy Ticket</h1>
        <p className="mt-1 text-sm text-white/55">Select a main number, then choose available subtickets.</p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      {!grid ? (
        <div className="blx-panel p-6 text-sm text-white/55">No active grid is open right now.</div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="blx-panel p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{grid.title}</h2>
                  <div className="mt-1 text-sm text-white/55">{formatDateTime(grid.openAt)} → {formatDateTime(grid.closeAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={isOpen ? 'green' : 'red'}>{isOpen ? 'OPEN NOW' : grid.status}</Badge>
                  <Badge tone="purple">Win {formatMoney(grid.winningAmountPerSubTicket)} each</Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm text-white/60">
                <div>Price: {formatMoney(grid.subTicketPrice)}</div>
                <div>Subtickets/main: {grid.subTicketsPerMain}</div>
                <div>Winning pool: {formatMoney(grid.winningPool)}</div>
                <div>Total value: {formatMoney(grid.totalValue)}</div>
              </div>
            </div>

            <div className="blx-panel p-6">
              <h3 className="font-semibold">Selection Summary</h3>
              <div className="mt-3 text-sm text-white/60">Selected subtickets: {totalSelected}</div>
              <div className="mt-2 text-2xl font-semibold">{formatMoney(totalAmount)}</div>
              <div className="mt-4 space-y-2 text-sm text-white/60 max-h-48 overflow-auto">
                {Object.entries(selections).filter(([, vals]) => vals.length > 0).map(([number, vals]) => (
                  <div key={number} className="rounded-xl border border-white/10 p-3">{number}: {vals.join(', ')}</div>
                ))}
                {totalSelected === 0 && <p>No subtickets selected yet.</p>}
              </div>
              <Button className="mt-4 w-full" onClick={() => void buyTickets()} disabled={!isOpen || loading || totalSelected === 0}>
                {loading ? 'Processing…' : 'Buy Selected Tickets'}
              </Button>
            </div>
          </div>

          <div className="blx-panel p-6">
            <h3 className="text-lg font-semibold">Main Ticket Numbers</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
              {numbers.map((item) => {
                const selectedCount = selections[item.number]?.length || 0
                return (
                  <button
                    key={item.id}
                    disabled={item.isSoldOut || !isOpen}
                    onClick={() => void loadSubTickets(item.number)}
                    className={[
                      'rounded-2xl border p-4 text-left transition',
                      item.isSoldOut ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-40 blur-[0.4px]' : 'border-white/10 bg-black/20 hover:border-purple-400/40',
                      selectedNumber === item.number ? 'ring-2 ring-purple-400/50' : '',
                    ].join(' ')}
                  >
                    <div className="text-xl font-semibold">{item.number}</div>
                    <div className="mt-2 text-xs text-white/45">Remaining {item.remainingCount}</div>
                    {selectedCount > 0 && <div className="mt-2 text-xs text-purple-300">Selected {selectedCount}</div>}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedNumber !== null && (
            <div className="blx-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Subtickets for number {selectedNumber}</h3>
                <div className="text-sm text-white/50">Choose any available subtickets</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {subTickets.map((sub) => {
                  const selected = (selections[selectedNumber] || []).includes(sub.subIndex)
                  const unavailable = sub.status !== 'AVAILABLE' || !isOpen
                  return (
                    <button
                      key={sub.id}
                      disabled={unavailable}
                      onClick={() => toggleSubTicket(sub.subIndex)}
                      className={[
                        'rounded-2xl border p-4 text-left transition',
                        unavailable ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-40' : 'border-white/10 bg-black/20 hover:border-purple-400/40',
                        selected ? 'ring-2 ring-purple-400/50 bg-purple-500/10' : '',
                      ].join(' ')}
                    >
                      <div className="font-semibold">{selectedNumber}-{sub.subIndex}</div>
                      <div className="mt-2 text-xs text-white/45">{sub.status}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
