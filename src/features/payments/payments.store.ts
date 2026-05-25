import { create } from 'zustand'
import type { CreatePaymentPayload, Payment } from './payments.types'
import { paymentsService } from './payments.service'

type PaymentsState = {
  mine: Payment[]
  all: Payment[]
  loading: boolean
  error: string | null
  fetchMine: () => Promise<void>
  fetchAll: () => Promise<void>
  createPayment: (payload: CreatePaymentPayload) => Promise<Payment | null>
  uploadSlip: (paymentId: string, file: File) => Promise<boolean>
  approvePayment: (paymentId: string, note?: string) => Promise<boolean>
  rejectPayment: (paymentId: string, reason?: string) => Promise<boolean>
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  mine: [],
  all: [],
  loading: false,
  error: null,

  async fetchMine() {
    set({ loading: true, error: null })
    const res = await paymentsService.listMine()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ mine: res.data, loading: false, error: null })
  },

  async fetchAll() {
    set({ loading: true, error: null })
    const res = await paymentsService.listAll()
    if (!res.ok) return set({ loading: false, error: res.error })
    set({ all: res.data, loading: false, error: null })
  },

  async createPayment(payload) {
    set({ loading: true, error: null })
    const res = await paymentsService.create(payload)
    if (!res.ok) {
      set({ loading: false, error: res.error })
      return null
    }
    set({ mine: [res.data, ...get().mine.filter((item) => item.id !== res.data.id)], loading: false, error: null })
    return res.data
  },

  async uploadSlip(paymentId, file) {
    set({ loading: true, error: null })
    const res = await paymentsService.uploadSlip(paymentId, file)
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({
      mine: get().mine.map((payment) => payment.id === paymentId ? res.data : payment),
      all: get().all.map((payment) => payment.id === paymentId ? res.data : payment),
      loading: false,
      error: null,
    })
    return true
  },

  async approvePayment(paymentId, note) {
    set({ loading: true, error: null })
    const res = await paymentsService.approve(paymentId, note)
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({
      all: get().all.map((payment) => payment.id === paymentId ? res.data : payment),
      mine: get().mine.map((payment) => payment.id === paymentId ? res.data : payment),
      loading: false,
      error: null,
    })
    return true
  },

  async rejectPayment(paymentId, reason) {
    set({ loading: true, error: null })
    const res = await paymentsService.reject(paymentId, reason)
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({
      all: get().all.map((payment) => payment.id === paymentId ? res.data : payment),
      mine: get().mine.map((payment) => payment.id === paymentId ? res.data : payment),
      loading: false,
      error: null,
    })
    return true
  },
}))
