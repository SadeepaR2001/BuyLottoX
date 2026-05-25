import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatMoney } from '../../utils/money'

type RaffleTicket = { id: string; number: number; status: string }
type Raffle = {
  id: string
  title: string
  description: string
  value: number
  imageUrl?: string | null
  details?: string | null
  ticketPrice: number
  totalTickets: number
  status: string
  soldTickets: number
  availableTickets: number
  tickets?: RaffleTicket[]
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

function raffleImageSrc(imageUrl?: string | null) {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
}

export default function Raffles() {
  const navigate = useNavigate()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [selectedRaffleId, setSelectedRaffleId] = useState('')
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selectedRaffle = useMemo(() => raffles.find((r) => r.id === selectedRaffleId) ?? null, [raffles, selectedRaffleId])

  const loadOpenRaffles = async () => {
    const res = await apiGet<Raffle[]>(endpoints.raffles.open)
    if (!res.ok) return setError(res.error)
    setRaffles(res.data)
    setSelectedRaffleId((current) => current && res.data.some((r) => r.id === current) ? current : res.data[0]?.id ?? '')
  }

  useEffect(() => { void loadOpenRaffles() }, [])

  useEffect(() => {
    if (!selectedRaffleId) return
    void (async () => {
      setLoadingDetails(true)
      setSelectedNumbers([])
      const res = await apiGet<Raffle>(endpoints.raffles.one(selectedRaffleId))
      setLoadingDetails(false)
      if (!res.ok) return setError(res.error)
      setRaffles((prev) => prev.map((r) => r.id === selectedRaffleId ? res.data : r))
    })()
  }, [selectedRaffleId])

  const toggleNumber = (number: number) => {
    setSelectedNumbers((prev) => prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number])
  }

  const buyTickets = async () => {
    if (!selectedRaffle) return
    const numbersToBuy = [...selectedNumbers]
    setError(null)
    setMessage(null)
    if (numbersToBuy.length === 0) {
      setError('Select at least one raffle ticket')
      return
    }
    const res = await apiPost<any>(endpoints.raffles.buy(selectedRaffle.id), { ticketNumbers: numbersToBuy })
    if (!res.ok) return setError(res.error)
    setMessage('Raffle tickets selected. Please upload your payment slip to reserve them.')
    setSelectedNumbers([])
    navigate('/payments', {
      state: {
        rafflePurchaseId: res.data.rafflePurchaseId,
        totalAmount: res.data.totalAmount,
        totalRaffleTickets: res.data.totalTickets,
        raffleId: selectedRaffle.id,
        raffleTitle: selectedRaffle.title,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Raffle Draws</h1>
        <p className="mt-1 text-sm text-white/55">Select a raffle draw and buy available raffle tickets.</p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {raffles.map((raffle) => (
          <button key={raffle.id} onClick={() => setSelectedRaffleId(raffle.id)} className={`rounded-2xl border p-4 text-left transition ${selectedRaffleId === raffle.id ? 'border-purple-400/70 bg-purple-500/10' : 'border-white/10 bg-black/20 hover:border-purple-400/40'}`}>
            {raffle.imageUrl && <img src={raffleImageSrc(raffle.imageUrl)} alt={raffle.title} className="mb-3 h-36 w-full rounded-xl object-cover" />}
            <div className="flex items-center justify-between gap-3"><div className="font-semibold">{raffle.title}</div><Badge tone="green">OPEN</Badge></div>
            <p className="mt-2 line-clamp-3 text-sm text-white/55">{raffle.description}</p>
            <div className="mt-3 grid gap-1 text-sm text-white/60">
              <div>Prize value: {formatMoney(raffle.value)}</div>
              <div>Ticket price: {formatMoney(raffle.ticketPrice)}</div>
              <div>Available: {raffle.availableTickets}/{raffle.totalTickets}</div>
            </div>
          </button>
        ))}
        {raffles.length === 0 && <div className="rounded-2xl border border-white/10 p-6 text-sm text-white/55">No open raffle draw available.</div>}
      </div>

      {selectedRaffle && (
        <div className="blx-panel p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{selectedRaffle.title}</h2>
              <p className="mt-2 text-sm text-white/60">{selectedRaffle.description}</p>
              {selectedRaffle.details && <p className="mt-2 text-sm text-purple-200/80">{selectedRaffle.details}</p>}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
              <div>Selected: {selectedNumbers.length}</div>
              <div>Total: {formatMoney(selectedNumbers.length * selectedRaffle.ticketPrice)}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {loadingDetails && <p className="text-sm text-white/55">Loading tickets…</p>}
            {selectedRaffle.tickets?.map((ticket) => {
              const selected = selectedNumbers.includes(ticket.number)
              const available = ticket.status === 'AVAILABLE'
              return (
                <button key={ticket.id} disabled={!available} onClick={() => toggleNumber(ticket.number)} className={`h-11 min-w-12 rounded-xl border px-3 text-sm font-semibold ${!available ? 'cursor-not-allowed border-white/5 bg-white/5 text-white/25' : selected ? 'border-purple-300 bg-purple-500 text-white' : 'border-white/10 bg-black/30 text-white/75 hover:border-purple-400/60'}`}>
                  {ticket.number}
                </button>
              )
            })}
          </div>

          <div className="mt-5">
            <Button disabled={selectedNumbers.length === 0} onClick={() => void buyTickets()}>Buy Selected Raffle Tickets</Button>
          </div>
        </div>
      )}
    </div>
  )
}
