import { create } from 'zustand'
import type { CreateDrawPayload, Draw } from './draws.types'
import { drawsService } from './draws.service'

type DrawsState = {
  active: Draw | null
  list: Draw[]
  loading: boolean
  error: string | null
  fetchActive: () => Promise<void>
  fetchList: () => Promise<void>
  createDraw: (payload: CreateDrawPayload) => Promise<boolean>
  closeDraw: (id: number) => Promise<boolean>
}

export const useDrawsStore = create<DrawsState>((set, get) => ({
  active: null,
  list: [],
  loading: false,
  error: null,

  async fetchActive() {
    set({ loading: true, error: null })
    const res = await drawsService.getActive()
    if (!res.ok) return set({ active: null, loading: false, error: res.error })
    set({ active: res.data, loading: false, error: null })
  },

  async fetchList() {
    set({ loading: true, error: null })
    const res = await drawsService.listAll()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ list: res.data, loading: false, error: null })
  },

  async createDraw(payload) {
    set({ loading: true, error: null })
    const res = await drawsService.create(payload)
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({ list: [res.data, ...get().list], loading: false, error: null })
    return true
  },

  async closeDraw(id) {
    set({ loading: true, error: null })
    const res = await drawsService.close(id)
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({
      list: get().list.map((draw) => (draw.id === id ? res.data : draw)),
      active: get().active?.id === id ? null : get().active,
      loading: false,
      error: null,
    })
    return true
  },
}))
