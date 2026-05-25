import { useEffect, useState } from 'react'
import { apiGet, apiPatch, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { formatMoney } from '../../utils/money'

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
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

function raffleImageSrc(imageUrl?: string | null) {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
}

const initialForm = {
  title: '',
  description: '',
  value: 10000,
  imageUrl: '',
  details: '',
  ticketPrice: 100,
  totalTickets: 100,
}

export default function AdminRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [form, setForm] = useState(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadRaffles = async () => {
    const res = await apiGet<Raffle[]>(endpoints.raffles.adminList)
    if (res.ok) setRaffles(res.data)
    else setError(res.error)
  }

  useEffect(() => { void loadRaffles() }, [])

  const createRaffle = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const payload = new FormData()
    payload.append('title', form.title.trim())
    payload.append('description', form.description.trim())
    payload.append('value', String(Number(form.value)))
    payload.append('imageUrl', form.imageUrl.trim())
    payload.append('details', form.details.trim())
    payload.append('ticketPrice', String(Number(form.ticketPrice)))
    payload.append('totalTickets', String(Number(form.totalTickets)))
    if (imageFile) payload.append('image', imageFile)

    const res = await apiPost<Raffle>(endpoints.raffles.adminCreate, payload)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    setMessage('Raffle draw created successfully')
    setForm(initialForm)
    setImageFile(null)
    await loadRaffles()
  }

  const toggleRaffle = async (raffle: Raffle, action: 'open' | 'close') => {
    setError(null)
    setMessage(null)
    const url = action === 'open' ? endpoints.raffles.adminOpen(raffle.id) : endpoints.raffles.adminClose(raffle.id)
    const res = await apiPatch<Raffle>(url)
    if (!res.ok) return setError(res.error)
    setMessage(`Raffle ${action}ed successfully`)
    await loadRaffles()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Raffle Draw Management</h1>
        <p className="mt-1 text-sm text-white/55">Create raffle prizes and allow users to buy raffle tickets.</p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="blx-panel p-6">
          <h2 className="text-lg font-semibold">Create Raffle Draw</h2>
          <form className="mt-4 space-y-3" onSubmit={createRaffle}>
            <div><label className="text-sm text-white/70">Title</label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="text-sm text-white/70">Description</label><textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-400" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
            <div><label className="text-sm text-white/70">Prize / Value</label><Input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))} /></div>
            <div><label className="text-sm text-white/70">Upload Image</label><Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} /></div>
            <div><label className="text-sm text-white/70">Image URL optional</label><Input value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://... or upload image above" /></div>
            {imageFile && <div className="text-xs text-white/50">Selected image: {imageFile.name}</div>}
            <div><label className="text-sm text-white/70">Matching / Extra Details</label><textarea className="min-h-20 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-400" value={form.details} onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))} /></div>
            <div><label className="text-sm text-white/70">Ticket Price</label><Input type="number" value={form.ticketPrice} onChange={(e) => setForm((p) => ({ ...p, ticketPrice: Number(e.target.value) }))} /></div>
            <div><label className="text-sm text-white/70">Total Tickets</label><Input type="number" value={form.totalTickets} onChange={(e) => setForm((p) => ({ ...p, totalTickets: Number(e.target.value) }))} /></div>
            <Button className="w-full" type="submit" disabled={loading}>Create Raffle Draw</Button>
          </form>
        </div>

        <div className="blx-panel p-6">
          <h2 className="text-lg font-semibold">Existing Raffle Draws</h2>
          <div className="mt-4 space-y-4">
            {raffles.map((raffle) => (
              <div key={raffle.id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    {raffle.imageUrl && <img src={raffleImageSrc(raffle.imageUrl)} alt={raffle.title} className="h-20 w-24 rounded-xl object-cover" />}
                    <div>
                      <div className="font-semibold">{raffle.title}</div>
                      <div className="mt-1 max-w-xl text-sm text-white/55">{raffle.description}</div>
                      {raffle.details && <div className="mt-2 text-xs text-white/45">{raffle.details}</div>}
                    </div>
                  </div>
                  <Badge tone={raffle.status === 'OPEN' ? 'green' : raffle.status === 'CLOSED' ? 'red' : 'yellow'}>{raffle.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-white/60 md:grid-cols-4">
                  <div>Value: {formatMoney(raffle.value)}</div>
                  <div>Ticket: {formatMoney(raffle.ticketPrice)}</div>
                  <div>Sold: {raffle.soldTickets}/{raffle.totalTickets}</div>
                  <div>Available: {raffle.availableTickets}</div>
                </div>
                <div className="mt-4 flex gap-3">
                  {raffle.status !== 'OPEN' ? <Button onClick={() => void toggleRaffle(raffle, 'open')}>Open</Button> : <Button variant="secondary" onClick={() => void toggleRaffle(raffle, 'close')}>Close</Button>}
                </div>
              </div>
            ))}
            {raffles.length === 0 && <p className="text-sm text-white/55">No raffle draws created yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
