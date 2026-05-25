import { create } from 'zustand'
import type { AdminUser } from './admin.types'
import { adminService } from './admin.service'

type AdminState = {
  users: AdminUser[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  loading: false,
  error: null,
  async fetchUsers() {
    set({ loading: true, error: null })
    const res = await adminService.listUsers()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ users: res.data, loading: false, error: null })
  },
}))
