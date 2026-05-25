import type { ApiResult } from '../../types/shared'
import { apiGet, apiPost, http } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type { CreatePaymentPayload, Payment, PaymentStatus } from './payments.types'

const mapPayment = (row: any): Payment => ({
  id: String(row.id),
  purchaseId: row.purchaseId ? String(row.purchaseId) : null,
  rafflePurchaseId: row.rafflePurchaseId ? String(row.rafflePurchaseId) : null,
  userId: String(row.userId),
  reference: row.reference,
  amount: Number(row.amount),
  method: row.method,
  status: row.status,
  slipPath: row.slipPath,
  adminNote: row.adminNote,
  rejectionReason: row.rejectionReason,
  reviewedAt: row.reviewedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  user: row.user,
  purchase: row.purchase
    ? {
        id: String(row.purchase.id),
        gridId: String(row.purchase.gridId),
        status: row.purchase.status,
        totalAmount: Number(row.purchase.totalAmount),
        grid: row.purchase.grid,
        subTickets: Array.isArray(row.purchase.subTickets) ? row.purchase.subTickets : [],
      }
    : undefined,
  rafflePurchase: row.rafflePurchase
    ? {
        id: String(row.rafflePurchase.id),
        raffleId: String(row.rafflePurchase.raffleId),
        status: row.rafflePurchase.status,
        totalAmount: Number(row.rafflePurchase.totalAmount),
        raffle: row.rafflePurchase.raffle,
        tickets: Array.isArray(row.rafflePurchase.tickets) ? row.rafflePurchase.tickets : [],
      }
    : undefined,
})

export const paymentsService = {
  async listMine(): Promise<ApiResult<Payment[]>> {
    const res = await apiGet<any[]>(endpoints.payments.list)
    return res.ok ? { ok: true, data: res.data.map(mapPayment), status: res.status } : res
  },
  async create(payload: CreatePaymentPayload): Promise<ApiResult<Payment>> {
    const res = await apiPost<any>(endpoints.payments.create, payload)
    return res.ok ? { ok: true, data: mapPayment(res.data), status: res.status } : res
  },
  async getOne(id: string): Promise<ApiResult<Payment>> {
    const res = await apiGet<any>(endpoints.payments.one(id))
    return res.ok ? { ok: true, data: mapPayment(res.data), status: res.status } : res
  },
  async uploadSlip(paymentId: string, file: File): Promise<ApiResult<Payment>> {
    try {
      const form = new FormData()
      form.append('slip', file)
      const res = await http.post<any>(endpoints.payments.slip(paymentId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { ok: true, data: mapPayment(res.data), status: res.status }
    } catch (error: any) {
      return { ok: false, error: error?.response?.data?.message || error?.response?.data?.error || 'Upload failed' }
    }
  },
  async listAll(): Promise<ApiResult<Payment[]>> {
    const res = await apiGet<any[]>(endpoints.payments.adminList)
    return res.ok ? { ok: true, data: res.data.map(mapPayment), status: res.status } : res
  },
  async approve(paymentId: string, note?: string): Promise<ApiResult<Payment>> {
    const res = await apiPost<any>(endpoints.payments.adminApprove(paymentId), note ? { note } : {})
    return res.ok ? { ok: true, data: mapPayment(res.data), status: res.status } : res
  },
  async reject(paymentId: string, reason?: string): Promise<ApiResult<Payment>> {
    const res = await apiPost<any>(endpoints.payments.adminReject(paymentId), reason ? { reason } : {})
    return res.ok ? { ok: true, data: mapPayment(res.data), status: res.status } : res
  },
}
