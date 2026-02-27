import { create } from 'zustand'
import { storage } from '../../utils/storage'
import type { AuthUser } from './auth.types'
import { authService } from './auth.service'

type AuthState = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  loadFromStorage: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const TOKEN_KEY = 'blx_token'
const USER_KEY = 'blx_user'

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storage.get<string>(TOKEN_KEY),
  user: storage.get<AuthUser>(USER_KEY),
  loading: false,
  error: null,
  isAuthenticated: !!storage.get<string>(TOKEN_KEY),

  async loadFromStorage() {
    const token = storage.get<string>(TOKEN_KEY)
    const user = storage.get<AuthUser>(USER_KEY)
    set({ token, user, isAuthenticated: !!token })
    if (token && !user) {
      set({ loading: true })
      const res = await authService.me(token)
      if (res.ok) {
        storage.set(USER_KEY, res.data)
        set({ user: res.data, loading: false, error: null, isAuthenticated: true })
      } else {
        storage.remove(TOKEN_KEY); storage.remove(USER_KEY)
        set({ token: null, user: null, loading: false, error: null, isAuthenticated: false })
      }
    }
  },

  async login(email, password) {
    set({ loading: true, error: null })
    const res = await authService.login({ email, password })
    if (!res.ok) return set({ loading: false, error: res.error }), false
    storage.set(TOKEN_KEY, res.data.token)
    storage.set(USER_KEY, res.data.user)
    set({ token: res.data.token, user: res.data.user, loading: false, error: null, isAuthenticated: true })
    return true
  },

  async register(name, email, password) {
    set({ loading: true, error: null })
    const res = await authService.register({ name, email, password })
    if (!res.ok) return set({ loading: false, error: res.error }), false
    storage.set(TOKEN_KEY, res.data.token)
    storage.set(USER_KEY, res.data.user)
    set({ token: res.data.token, user: res.data.user, loading: false, error: null, isAuthenticated: true })
    return true
  },

  async logout() {
    set({ loading: true, error: null })
    await authService.logout()
    storage.remove(TOKEN_KEY); storage.remove(USER_KEY)
    set({ token: null, user: null, loading: false, error: null, isAuthenticated: false })
  },
}))
