import { create } from 'zustand'
import type { Ticket } from './tickets.types'
import { ticketsService } from './tickets.service'
import { useAuthStore } from '../auth/auth.store'

type TicketsState = {
  items: Ticket[]
  loading: boolean
  error: string | null
  fetchMine: () => Promise<void>
  createTicket: (drawId: string, numbers: number[]) => Promise<boolean>
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  async fetchMine() {
    const user = useAuthStore.getState().user
    if (!user) return
    set({ loading: true, error: null })
    const res = await ticketsService.myTickets(user.id)
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ items: res.data, loading: false, error: null })
  },

  async createTicket(drawId, numbers) {
    const user = useAuthStore.getState().user
    if (!user) return false
    set({ loading: true, error: null })
    const res = await ticketsService.create(user.id, { drawId, numbers })
    if (!res.ok) return set({ loading: false, error: res.error }), false
    // prepend
    set({ items: [res.data, ...get().items], loading: false, error: null })
    return true
  },
}))
