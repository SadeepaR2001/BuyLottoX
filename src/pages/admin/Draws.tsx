import { useEffect, useMemo, useState } from 'react'
import { adminService } from '../../features/admin/admin.service'
import type { AdminGrid, CreateGridPayload } from '../../features/admin/admin.types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime } from '../../utils/date'
import { formatMoney } from '../../utils/money'
import { useAuthStore } from '../../features/auth/auth.store'

const initialForm: CreateGridPayload = {
  title: '',
  openAt: '',
  closeAt: '',
  subTicketPrice: 200,
  commissionRate: 20,
  subTicketsPerMain: 10,
}

export default function Draws() {
  const user = useAuthStore((s) => s.user)
  const [grids, setGrids] = useState<AdminGrid[]>([])
  const [form, setForm] = useState<CreateGridPayload>(initialForm)
  const [winningNumbers, setWinningNumbers] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, CreateGridPayload>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadGrids = async () => {
    setLoading(true)
    const res = await adminService.listGrids()
    if (!res.ok) {
      setError(res.error)
      setLoading(false)
      return
    }
    setGrids(res.data)
    setLoading(false)
  }

  useEffect(() => { void loadGrids() }, [])

  const preview = useMemo(() => {
    const totalSubTickets = 100 * Number(form.subTicketsPerMain || 0)
    const totalValue = Number(form.subTicketPrice || 0) * totalSubTickets
    const commissionAmount = totalValue * (Number(form.commissionRate || 0) / 100)
    const winningPool = totalValue - commissionAmount
    const perSubTicket = Number(form.subTicketsPerMain || 0) > 0 ? winningPool / Number(form.subTicketsPerMain) : 0
    return { totalSubTickets, totalValue, commissionAmount, winningPool, perSubTicket }
  }, [form])

  const createGrid = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const payload = {
      ...form,
      subTicketPrice: Number(form.subTicketPrice),
      commissionRate: Number(form.commissionRate),
      subTicketsPerMain: Number(form.subTicketsPerMain),
      openAt: new Date(form.openAt).toISOString(),
      closeAt: new Date(form.closeAt).toISOString(),
    }
    const res = await adminService.createGrid(payload)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    setMessage('Grid created successfully')
    setForm(initialForm)
    await loadGrids()
  }


  const startEdit = (grid: AdminGrid) => {
    setEditingId(grid.id)
    setEditForms((prev) => ({
      ...prev,
      [grid.id]: {
        title: grid.title,
        openAt: grid.openAt ? new Date(grid.openAt).toISOString().slice(0, 16) : '',
        closeAt: grid.closeAt ? new Date(grid.closeAt).toISOString().slice(0, 16) : '',
        subTicketPrice: grid.subTicketPrice,
        commissionRate: grid.commissionRate,
        subTicketsPerMain: (grid as any).subTicketsPerMain || 10,
      },
    }))
  }

  const saveGridEdit = async (gridId: string) => {
    const edit = editForms[gridId]
    if (!edit) return
    setError(null)
    setMessage(null)
    const payload = {
      ...edit,
      subTicketPrice: Number(edit.subTicketPrice),
      commissionRate: Number(edit.commissionRate),
      subTicketsPerMain: Number(edit.subTicketsPerMain),
      openAt: new Date(edit.openAt).toISOString(),
      closeAt: new Date(edit.closeAt).toISOString(),
    }
    const res = await adminService.updateGrid(gridId, payload)
    if (!res.ok) return setError(res.error)
    setMessage('Grid updated successfully')
    setEditingId(null)
    await loadGrids()
  }

  const toggleGrid = async (grid: AdminGrid, action: 'open' | 'close') => {
    setError(null)
    setMessage(null)
    const res = action === 'open' ? await adminService.openGrid(grid.id) : await adminService.closeGrid(grid.id)
    if (!res.ok) return setError(res.error)
    setMessage(`Grid ${action}ed successfully`)
    await loadGrids()
  }

  const saveWinningNumber = async (gridId: string) => {
    const winningNumber = Number(winningNumbers[gridId])
    if (Number.isNaN(winningNumber)) return setError('Enter a valid winning number')
    const res = await adminService.setWinningNumber(gridId, winningNumber)
    if (!res.ok) return setError(res.error)
    setMessage('Winning number updated')
    await loadGrids()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Grid Management</h1>
        <p className="mt-1 text-sm text-white/55">Create and manage time-based ticket grids.</p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="blx-panel p-6">
          <h2 className="text-lg font-semibold">Create Grid</h2>
          <form className="mt-4 space-y-3" onSubmit={createGrid}>
            <div>
              <label className="text-sm text-white/70">Title</label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-white/70">Open At</label>
              <Input type="datetime-local" value={form.openAt} onChange={(e) => setForm((prev) => ({ ...prev, openAt: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-white/70">Close At</label>
              <Input type="datetime-local" value={form.closeAt} onChange={(e) => setForm((prev) => ({ ...prev, closeAt: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-white/70">Sub Ticket Price</label>
              <Input type="number" value={form.subTicketPrice} onChange={(e) => setForm((prev) => ({ ...prev, subTicketPrice: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm text-white/70">Commission Rate (%)</label>
              <Input type="number" value={form.commissionRate} onChange={(e) => setForm((prev) => ({ ...prev, commissionRate: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm text-white/70">Sub Tickets Per Main Ticket</label>
              <Input type="number" value={form.subTicketsPerMain} onChange={(e) => setForm((prev) => ({ ...prev, subTicketsPerMain: Number(e.target.value) }))} />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
              <div>Total subtickets: {preview.totalSubTickets}</div>
              <div>Total value: {formatMoney(preview.totalValue)}</div>
              <div>Commission: {formatMoney(preview.commissionAmount)}</div>
              <div>Winning pool: {formatMoney(preview.winningPool)}</div>
              <div>Winning amount per subticket: {formatMoney(preview.perSubTicket)}</div>
            </div>

            <Button className="w-full" type="submit" disabled={loading}>Create Grid</Button>
          </form>
        </div>

        <div className="blx-panel p-6">
          <h2 className="text-lg font-semibold">Existing Grids</h2>
          <div className="mt-4 space-y-4">
            {grids.map((grid) => (
              <div key={grid.id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="font-semibold">{grid.title}</div>
                    <div className="mt-1 text-sm text-white/55">{formatDateTime(grid.openAt)} → {formatDateTime(grid.closeAt)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={grid.status === 'OPEN' ? 'green' : grid.status === 'CLOSED' ? 'red' : 'yellow'}>{grid.status}</Badge>
                    <Badge tone="purple">Pool {formatMoney(grid.winningPool)}</Badge>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-white/60 md:grid-cols-4">
                  <div>Price: {formatMoney(grid.subTicketPrice)}</div>
                  <div>Commission: {grid.commissionRate}%</div>
                  <div>Total: {formatMoney(grid.totalValue)}</div>
                  <div>Winning #: {grid.winningNumber ?? 'Not set'}</div>
                </div>
                {editingId === grid.id && (
                  <div className="mt-4 rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><label className="text-xs text-white/60">Title</label><Input value={editForms[grid.id]?.title ?? ''} onChange={(e) => setEditForms((prev) => ({ ...prev, [grid.id]: { ...(prev[grid.id] || initialForm), title: e.target.value } }))} /></div>
                      <div><label className="text-xs text-white/60">Sub Ticket Price</label><Input type="number" value={editForms[grid.id]?.subTicketPrice ?? ''} onChange={(e) => setEditForms((prev) => ({ ...prev, [grid.id]: { ...(prev[grid.id] || initialForm), subTicketPrice: Number(e.target.value) } }))} /></div>
                      <div><label className="text-xs text-white/60">Open At</label><Input type="datetime-local" value={editForms[grid.id]?.openAt ?? ''} onChange={(e) => setEditForms((prev) => ({ ...prev, [grid.id]: { ...(prev[grid.id] || initialForm), openAt: e.target.value } }))} /></div>
                      <div><label className="text-xs text-white/60">Close At</label><Input type="datetime-local" value={editForms[grid.id]?.closeAt ?? ''} onChange={(e) => setEditForms((prev) => ({ ...prev, [grid.id]: { ...(prev[grid.id] || initialForm), closeAt: e.target.value } }))} /></div>
                      <div><label className="text-xs text-white/60">Commission Rate (%)</label><Input type="number" value={editForms[grid.id]?.commissionRate ?? ''} onChange={(e) => setEditForms((prev) => ({ ...prev, [grid.id]: { ...(prev[grid.id] || initialForm), commissionRate: Number(e.target.value) } }))} /></div>
                      <div><label className="text-xs text-white/60">Sub Tickets Per Main</label><Input type="number" value={editForms[grid.id]?.subTicketsPerMain ?? ''} onChange={(e) => setEditForms((prev) => ({ ...prev, [grid.id]: { ...(prev[grid.id] || initialForm), subTicketsPerMain: Number(e.target.value) } }))} /></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => void saveGridEdit(grid.id)}>Save Changes</Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {grid.status !== 'OPEN' ? (
                    <Button onClick={() => void toggleGrid(grid, 'open')}>Open</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => void toggleGrid(grid, 'close')}>Close</Button>
                  )}
                  <Button variant="secondary" onClick={() => startEdit(grid)}>Edit</Button>
                  <Input
                    className="max-w-36"
                    type="number"
                    min={0}
                    max={99}
                    placeholder="Winning #"
                    value={winningNumbers[grid.id] ?? ''}
                    onChange={(e) => setWinningNumbers((prev) => ({ ...prev, [grid.id]: Number(e.target.value) }))}
                  />
                  <Button variant="secondary" onClick={() => void saveWinningNumber(grid.id)}>Set Winning Number</Button>
                </div>
              </div>
            ))}
            {!loading && grids.length === 0 && <p className="text-sm text-white/55">No grids created yet.</p>}
          </div>
        </div>
      </div>

      {user?.role === 'SUPER_ADMIN' && (
        <p className="text-sm text-white/45">As super admin, you can also manage user roles from the Users page.</p>
      )}
    </div>
  )
}
