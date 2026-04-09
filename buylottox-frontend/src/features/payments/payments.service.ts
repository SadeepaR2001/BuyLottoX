import type { ApiResult } from '../../types/shared'
import { apiGet, apiPatch, apiPost, http } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type { CreatePaymentPayload, Payment, PaymentStatus } from './payments.types'

const mapPayment = (row: any): Payment => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  ticketId: row.ticket_id != null ? Number(row.ticket_id) : null,
  ticketCode: row.ticket_code,
  amount: Number(row.amount),
  method: row.method,
  referenceNo: row.reference_no,
  slipPath: row.slip_path,
  status: row.status,
  adminNotes: row.admin_notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  userName: row.user_name,
  userEmail: row.user_email,
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
  async uploadSlip(paymentId: number, file: File): Promise<ApiResult<Payment>> {
    try {
      const form = new FormData()
      form.append('slip', file)
      const { data } = await http.post<ApiResult<any>>(endpoints.payments.slip(paymentId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
return data.ok ? { ok: true, data: mapPayment(data.data), status: data.status } : data    } catch (error: any) {
      return { ok: false, error: error?.response?.data?.error || 'Upload failed' }
    }
  },
  async listAll(): Promise<ApiResult<Payment[]>> {
    const res = await apiGet<any[]>(endpoints.admin.payments)
return res.ok ? { ok: true, data: res.data.map(mapPayment), status: res.status } : res
  },
  async updateStatus(paymentId: number, status: PaymentStatus, notes?: string): Promise<ApiResult<Payment>> {
    const res = await apiPatch<any>(endpoints.admin.paymentUpdate(paymentId), { status, notes })
return res.ok ? { ok: true, data: mapPayment(res.data), status: res.status } : res  },
}
