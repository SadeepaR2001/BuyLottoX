import { create } from 'zustand'
import type { AdminUser, AdminUserHistory } from './admin.types'
import { adminService } from './admin.service'

type AdminState = {
  users: AdminUser[]
  selectedHistory: AdminUserHistory | null
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  fetchUserHistory: (id: number) => Promise<void>
  clearSelectedHistory: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  selectedHistory: null,
  loading: false,
  error: null,

  async fetchUsers() {
    set({ loading: true, error: null })
    const res = await adminService.listUsers()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ users: res.data, loading: false, error: null })
  },

  async fetchUserHistory(id) {
    set({ loading: true, error: null })
    const res = await adminService.getUserHistory(id)
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ selectedHistory: res.data, loading: false, error: null })
  },

  clearSelectedHistory() {
    set({ selectedHistory: null })
  },
}))
