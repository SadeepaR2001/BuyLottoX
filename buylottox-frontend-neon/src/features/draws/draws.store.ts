import { create } from 'zustand'
import type { Draw } from './draws.types'
import { drawsService } from './draws.service'

type DrawsState = {
  active: Draw | null
  list: Draw[]
  loading: boolean
  error: string | null
  fetchActive: () => Promise<void>
  fetchList: () => Promise<void>
}

export const useDrawsStore = create<DrawsState>((set) => ({
  active: null,
  list: [],
  loading: false,
  error: null,

  async fetchActive() {
    set({ loading: true, error: null })
    const res = await drawsService.getActive()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ active: res.data, loading: false, error: null })
  },

  async fetchList() {
    set({ loading: true, error: null })
    const res = await drawsService.listAll()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ list: res.data, loading: false, error: null })
  },
}))
