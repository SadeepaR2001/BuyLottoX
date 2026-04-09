import { create } from 'zustand'
import { storage } from '../../utils/storage'
import type { AuthUser } from './auth.types'
import { authService } from './auth.service'

type AuthState = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  error: string | null
  infoMessage: string | null
  isAuthenticated: boolean
  loadFromStorage: () => Promise<void>
  login: (mobileNumber: string, password: string) => Promise<boolean>
  register: (name: string, mobileNumber: string, password: string) => Promise<boolean>
  verifyOtp: (mobileNumber: string, code: string) => Promise<boolean>
  sendOtp: (mobileNumber: string) => Promise<boolean>
  resendOtp: (mobileNumber: string) => Promise<boolean>
  sendForgotPasswordOtp: (mobileNumber: string) => Promise<boolean>
  verifyForgotPasswordOtp: (mobileNumber: string, code: string) => Promise<boolean>
  resetPassword: (mobileNumber: string, code: string, newPassword: string) => Promise<boolean>
  clearMessages: () => void
  logout: () => Promise<void>
}

const TOKEN_KEY = 'blx_token'
const USER_KEY = 'blx_user'

export const useAuthStore = create<AuthState>((set) => ({
  token: storage.get<string>(TOKEN_KEY),
  user: storage.get<AuthUser>(USER_KEY),
  loading: false,
  error: null,
  infoMessage: null,
  isAuthenticated: !!storage.get<string>(TOKEN_KEY),

  async loadFromStorage() {
    const token = storage.get<string>(TOKEN_KEY)
    const user = storage.get<AuthUser>(USER_KEY)
    set({ token, user, isAuthenticated: !!token })
    if (token) {
      const res = await authService.me()
      if (res.ok) {
        storage.set(USER_KEY, res.data)
        set({ user: res.data, error: null, infoMessage: null, isAuthenticated: true })
      } else {
        storage.remove(TOKEN_KEY)
        storage.remove(USER_KEY)
        set({ token: null, user: null, error: null, infoMessage: null, isAuthenticated: false })
      }
    }
  },

  async login(mobileNumber, password) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.login({ mobileNumber, password })
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    storage.set(TOKEN_KEY, res.data.accessToken)
    storage.set(USER_KEY, res.data.user)
    set({ token: res.data.accessToken, user: res.data.user, loading: false, error: null, infoMessage: null, isAuthenticated: true })
    return true
  },

  async register(name, mobileNumber, password) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.register({ name, mobileNumber, password })
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    storage.set(TOKEN_KEY, res.data.accessToken)
    storage.set(USER_KEY, res.data.user)
    set({ token: res.data.accessToken, user: res.data.user, loading: false, error: null, infoMessage: null, isAuthenticated: true })
    return true
  },

  async sendOtp(mobileNumber) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.sendOtp(mobileNumber)
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    set({ loading: false, error: null, infoMessage: res.data.message ?? 'OTP sent successfully.' })
    return true
  },

  async resendOtp(mobileNumber) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.resendOtp(mobileNumber)
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    set({ loading: false, error: null, infoMessage: res.data.message ?? 'OTP resent successfully.' })
    return true
  },

  async verifyOtp(mobileNumber, code) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.verifyOtp(mobileNumber, code)
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    const meRes = await authService.me()
    if (meRes.ok) {
      storage.set(USER_KEY, meRes.data)
      set({ user: meRes.data })
    }
    set({ loading: false, error: null, infoMessage: res.data.message ?? 'OTP verified successfully.' })
    return true
  },

  async sendForgotPasswordOtp(mobileNumber) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.sendForgotPasswordOtp({ mobileNumber })
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    set({ loading: false, error: null, infoMessage: res.data.message ?? 'Reset OTP sent successfully.' })
    return true
  },

  async verifyForgotPasswordOtp(mobileNumber, code) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.verifyForgotPasswordOtp({ mobileNumber, code })
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    set({ loading: false, error: null, infoMessage: res.data.message ?? 'OTP verified successfully.' })
    return true
  },

  async resetPassword(mobileNumber, code, newPassword) {
    set({ loading: true, error: null, infoMessage: null })
    const res = await authService.resetPassword({ mobileNumber, code, newPassword })
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return false
    }
    set({ loading: false, error: null, infoMessage: res.data.message ?? 'Password reset successfully.' })
    return true
  },

  clearMessages() {
    set({ error: null, infoMessage: null })
  },

  async logout() {
    storage.remove(TOKEN_KEY)
    storage.remove(USER_KEY)
    set({ token: null, user: null, loading: false, error: null, infoMessage: null, isAuthenticated: false })
  },
}))
