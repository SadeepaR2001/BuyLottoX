import { create } from 'zustand'
import type { Ticket, TicketStatus } from './tickets.types'
import { ticketsService } from './tickets.service'

type TicketsState = {
  items: Ticket[]
  loading: boolean
  error: string | null
  fetchMine: () => Promise<void>
  createTicket: (drawId: number, numbers: number[]) => Promise<boolean>
  updateTicketStatus: (id: number, status: TicketStatus, notes?: string) => Promise<boolean>
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  async fetchMine() {
    set({ loading: true, error: null })
    const res = await ticketsService.myTickets()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ items: res.data, loading: false, error: null })
  },

  async createTicket(drawId, numbers) {
    set({ loading: true, error: null })
    const res = await ticketsService.create({ drawId, numbers })
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({ items: [res.data, ...get().items], loading: false, error: null })
    return true
  },

  async updateTicketStatus(id, status, notes) {
    set({ loading: true, error: null })
    const res = await ticketsService.updateStatus(id, status, notes)
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({ items: get().items.map((ticket) => ticket.id === id ? res.data : ticket), loading: false, error: null })
    return true
  },
}))
