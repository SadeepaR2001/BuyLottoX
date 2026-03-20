import { create } from 'zustand'
import type { CreatePaymentPayload, Payment, PaymentStatus } from './payments.types'
import { paymentsService } from './payments.service'

type PaymentsState = {
  mine: Payment[]
  all: Payment[]
  loading: boolean
  error: string | null
  fetchMine: () => Promise<void>
  fetchAll: () => Promise<void>
  createPayment: (payload: CreatePaymentPayload) => Promise<Payment | null>
  uploadSlip: (paymentId: number, file: File) => Promise<boolean>
  updatePaymentStatus: (paymentId: number, status: PaymentStatus, notes?: string) => Promise<boolean>
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
    set({ mine: [res.data, ...get().mine], loading: false, error: null })
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

  async updatePaymentStatus(paymentId, status, notes) {
    set({ loading: true, error: null })
    const res = await paymentsService.updateStatus(paymentId, status, notes)
    if (!res.ok) return set({ loading: false, error: res.error }), false
    set({
      mine: get().mine.map((payment) => payment.id === paymentId ? res.data : payment),
      all: get().all.map((payment) => payment.id === paymentId ? res.data : payment),
      loading: false,
      error: null,
    })
    return true
  },
}))
