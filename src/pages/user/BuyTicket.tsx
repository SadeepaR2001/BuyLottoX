import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  reservedCount?: number
  remainingCount: number
}

type SubTicket = {
  id: string
  subIndex: number
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD'
  soldAt: string | null
}

export default function BuyTicket() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedGridId = searchParams.get('gridId')
  const [grids, setGrids] = useState<ActiveGrid[]>([])
  const [selectedGrid, setSelectedGrid] = useState<ActiveGrid | null>(null)
  const [numbers, setNumbers] = useState<GridNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [subTickets, setSubTickets] = useState<SubTicket[]>([])
  const [selections, setSelections] = useState<Record<number, number[]>>({})
  const [loading, setLoading] = useState(false)
  const [numbersLoading, setNumbersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadNumbersForGrid = async (grid: ActiveGrid) => {
    setNumbersLoading(true)
    setError(null)
    const res = await apiGet<GridNumber[]>(endpoints.grid.numbers(grid.id))
    setNumbersLoading(false)

    if (!res.ok) {
      setNumbers([])
      return setError(res.error)
    }

    setNumbers(res.data)
  }

  const selectGrid = async (grid: ActiveGrid, updateUrl = true) => {
    setSelectedGrid(grid)
    if (updateUrl) setSearchParams({ gridId: grid.id }, { replace: true })
    setSelections({})
    setSelectedNumber(null)
    setSubTickets([])
    await loadNumbersForGrid(grid)
  }

  const loadGrids = async () => {
    setError(null)
    const res = await apiGet<ActiveGrid[]>(endpoints.grid.active)

    if (!res.ok) return setError(res.error)

    setGrids(res.data)

    if (res.data.length === 0) {
      setSelectedGrid(null)
      setNumbers([])
      setSelectedNumber(null)
      setSubTickets([])
      setSelections({})
      return
    }

    // IMPORTANT: when dashboard or user click passes ?gridId=..., that selected grid
    // must win over the previously selected/latest grid. Otherwise the page can
    // show numbers from the clicked grid briefly, then fall back to the last
    // created grid when active grids are refreshed.
    const requestedGrid = requestedGridId
      ? res.data.find((grid) => grid.id === requestedGridId) ?? null
      : null
    const stillOpenSelectedGrid = selectedGrid
      ? res.data.find((grid) => grid.id === selectedGrid.id) ?? null
      : null

    await selectGrid(requestedGrid ?? stillOpenSelectedGrid ?? res.data[0], false)
  }

  useEffect(() => {
    void loadGrids()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedGridId])

  const loadSubTickets = async (number: number) => {
    if (!selectedGrid) return
    setSelectedNumber(number)
    setError(null)
    const res = await apiGet<{ number: number; subTickets: SubTicket[] }>(endpoints.grid.subTickets(selectedGrid.id, number))
    if (!res.ok) return setError(res.error)
    setSubTickets(res.data.subTickets)
  }

  const toggleSubTicket = (subIndex: number) => {
    if (selectedNumber === null) return
    setSelections((prev) => {
      const current = prev[selectedNumber] || []
      const next = current.includes(subIndex)
        ? current.filter((item) => item !== subIndex)
        : [...current, subIndex].sort((a, b) => a - b)
      return { ...prev, [selectedNumber]: next }
    })
  }

  const totalSelected = useMemo(
    () => Object.values(selections).reduce((sum, items) => sum + items.length, 0),
    [selections],
  )

  const totalAmount = useMemo(
    () => (selectedGrid ? totalSelected * selectedGrid.subTicketPrice : 0),
    [selectedGrid, totalSelected],
  )

  const buyTickets = async () => {
    if (!selectedGrid || totalSelected === 0) return

    setLoading(true)
    setError(null)
    setMessage(null)

    const payload = {
      gridId: selectedGrid.id,
      selections: Object.entries(selections)
        .filter(([, subIndexes]) => subIndexes.length > 0)
        .map(([number, subIndexes]) => ({ number: Number(number), subIndexes })),
    }

    const res = await apiPost<{
      message: string
      totalAmount: number
      purchaseId: string
      totalSubTickets: number
    }>(endpoints.grid.buy(selectedGrid.id), payload)

    setLoading(false)

    if (!res.ok) return setError(res.error)

    setMessage(res.data.message)
    setSelections({})
    setSelectedNumber(null)
    setSubTickets([])
    await loadNumbersForGrid(selectedGrid)

    navigate('/payments', {
      state: {
        purchaseId: res.data.purchaseId,
        totalAmount: res.data.totalAmount,
        totalSubTickets: res.data.totalSubTickets,
        gridId: selectedGrid.id,
        gridTitle: selectedGrid.title,
      },
    })
  }

  const now = new Date().getTime()
  const isOpen = selectedGrid
    ? now >= new Date(selectedGrid.openAt).getTime() && now <= new Date(selectedGrid.closeAt).getTime() && selectedGrid.status === 'OPEN'
    : false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Buy Ticket</h1>
        <p className="mt-1 text-sm text-white/55">Select an open grid first, then choose a main number and subtickets.</p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <div className="blx-panel p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Open Grids</h2>
            <p className="text-sm text-white/55">Users can buy tickets from any grid shown here.</p>
          </div>
          <Badge tone={grids.length > 0 ? 'green' : 'red'}>{grids.length} OPEN</Badge>
        </div>

        {grids.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 p-4 text-sm text-white/55">No active grid is open right now.</div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {grids.map((grid) => {
              const selected = selectedGrid?.id === grid.id
              return (
                <button
                  key={grid.id}
                  type="button"
                  onClick={() => void selectGrid(grid, true)}
                  className={[
                    'rounded-2xl border p-4 text-left transition',
                    selected ? 'border-purple-400/70 bg-purple-500/10 ring-2 ring-purple-400/30' : 'border-white/10 bg-black/20 hover:border-purple-400/40',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{grid.title}</div>
                      <div className="mt-1 text-xs text-white/50">{formatDateTime(grid.openAt)} → {formatDateTime(grid.closeAt)}</div>
                    </div>
                    <Badge tone="green">OPEN</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-white/60 sm:grid-cols-2">
                    <div>Price: {formatMoney(grid.subTicketPrice)}</div>
                    <div>Win each: {formatMoney(grid.winningAmountPerSubTicket)}</div>
                    <div>Pool: {formatMoney(grid.winningPool)}</div>
                    <div>Sub/main: {grid.subTicketsPerMain}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedGrid && (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="blx-panel p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedGrid.title}</h2>
                  <div className="mt-1 text-sm text-white/55">{formatDateTime(selectedGrid.openAt)} → {formatDateTime(selectedGrid.closeAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={isOpen ? 'green' : 'red'}>{isOpen ? 'OPEN NOW' : selectedGrid.status}</Badge>
                  <Badge tone="purple">Win {formatMoney(selectedGrid.winningAmountPerSubTicket)} each</Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-white/60 md:grid-cols-4">
                <div>Price: {formatMoney(selectedGrid.subTicketPrice)}</div>
                <div>Subtickets/main: {selectedGrid.subTicketsPerMain}</div>
                <div>Winning pool: {formatMoney(selectedGrid.winningPool)}</div>
                <div>Total value: {formatMoney(selectedGrid.totalValue)}</div>
              </div>
            </div>

            <div className="blx-panel p-6">
              <h3 className="font-semibold">Selection Summary</h3>
              <div className="mt-3 text-sm text-white/60">Selected subtickets: {totalSelected}</div>
              <div className="mt-2 text-2xl font-semibold">{formatMoney(totalAmount)}</div>
              <div className="mt-4 max-h-48 space-y-2 overflow-auto text-sm text-white/60">
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
            {numbersLoading ? (
              <p className="mt-4 text-sm text-white/55">Loading numbers…</p>
            ) : (
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
            )}
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
                        selected ? 'bg-purple-500/10 ring-2 ring-purple-400/50' : '',
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
