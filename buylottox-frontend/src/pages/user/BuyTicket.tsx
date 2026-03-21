import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useDrawsStore } from '../../features/draws/draws.store'
import { useTicketsStore } from '../../features/tickets/tickets.store'
import { cn } from '../../utils/cn'
import { formatMoney } from '../../utils/money'

const RULE = { pick: 6, min: 1, max: 49 }

export default function BuyTicket() {
  const { active, fetchActive } = useDrawsStore()
  const { createTicket, loading, error } = useTicketsStore()
  const [selected, setSelected] = useState<number[]>([])
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => { void fetchActive() }, [fetchActive])

  const canSubmit = useMemo(() => selected.length === RULE.pick && !!active && !loading, [selected.length, active, loading])

  const toggle = (n: number) => {
    setSuccess(null)
    setSelected((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n)
      if (prev.length >= RULE.pick) return prev
      return [...prev, n].sort((a, b) => a - b)
    })
  }

  const submit = async () => {
    if (!active) return
    const ok = await createTicket(active.id, selected)
    if (ok) {
      setSuccess('Ticket created. Next step: create a payment and upload your slip.')
      setSelected([])
    }
  }

  const randomPick = () => {
    const nums = new Set<number>()
    while (nums.size < RULE.pick) {
      nums.add(Math.floor(Math.random() * RULE.max) + RULE.min)
    }
    setSelected(Array.from(nums).sort((a, b) => a - b))
  }

  const nums = useMemo(() => Array.from({ length: RULE.max - RULE.min + 1 }, (_, i) => i + RULE.min), [])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="blx-panel-strong overflow-hidden">
          <div className="relative p-6">
            <div className="absolute inset-0 bg-panel-sparkle opacity-70" />
            <div className="relative">
              <div className="text-xs tracking-widest text-white/50">JACKPOT</div>
              <div className="mt-2 text-4xl font-extrabold">{active ? formatMoney(active.jackpotAmount) : '—'}</div>
              <div className="mt-2 text-sm text-white/55">{active ? `${active.title} • Active Draw` : 'No active draw available'}</div>
            </div>
          </div>
        </div>

        <div className="blx-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold">Pick your numbers</h1>
            <div className="flex items-center gap-2">
              <Badge tone="purple">{`${selected.length}/${RULE.pick}`}</Badge>
              <Button variant="secondary" onClick={randomPick}>Quick Pick</Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 sm:grid-cols-10">
            {nums.map((n) => {
              const on = selected.includes(n)
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  className={cn(
                    'h-11 rounded-full border text-sm font-semibold transition',
                    on
                      ? 'border-purple-400/60 bg-purple-500/25 text-white shadow-neonStrong'
                      : 'border-white/10 bg-black/30 text-white/75 hover:bg-white/5 hover:text-white'
                  )}
                  aria-pressed={on}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="blx-panel p-6">
          <h2 className="font-semibold">Your ticket</h2>
          <div className="mt-3 text-sm text-white/55">
            Active draw: <span className="text-white">{active?.title ?? 'Loading…'}</span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-white/40">Selected</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.length ? selected.map((n) => <span key={n} className="blx-chip">{n}</span>) : <span className="text-sm text-white/45">—</span>}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-white/55">Ticket Price</span>
            <span className="font-semibold">{active ? formatMoney(active.ticketPrice) : '—'}</span>
          </div>

          {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          {success && <p className="mt-3 text-sm text-emerald-300">{success}</p>}

          <Button className="mt-5 w-full" disabled={!canSubmit} onClick={submit}>
            {loading ? 'Processing…' : 'Create Ticket'}
          </Button>
        </div>
      </div>
    </div>
  )
}
