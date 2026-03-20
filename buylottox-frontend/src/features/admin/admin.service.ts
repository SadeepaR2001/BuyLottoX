import type { ApiResult } from '../../types/shared'
import { apiGet } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type { AdminUser, AdminUserHistory } from './admin.types'

const mapAdminUser = (row: any): AdminUser => ({
  id: Number(row.id),
  name: row.name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
  ticketCount: Number(row.ticket_count),
  paymentCount: Number(row.payment_count),
  approvedPaymentTotal: Number(row.approved_payment_total),
})

const mapTicket = (row: any) => ({
  id: Number(row.id),
  ticketCode: row.ticket_code,
  userId: Number(row.user_id),
  drawId: Number(row.draw_id),
  drawTitle: row.draw_title,
  drawAt: row.draw_at,
  ticketPrice: row.ticket_price != null ? Number(row.ticket_price) : undefined,
  numbers: typeof row.numbers_json === 'string' ? JSON.parse(row.numbers_json) : row.numbers || [],
  status: row.status,
  adminNotes: row.admin_notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const mapPayment = (row: any) => ({
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
})

export const adminService = {
  async listUsers(): Promise<ApiResult<AdminUser[]>> {
    const res = await apiGet<any[]>(endpoints.admin.users)
    return res.ok ? { ok: true, data: res.data.map(mapAdminUser) } : res
  },
  async getUserHistory(id: number): Promise<ApiResult<AdminUserHistory>> {
    const res = await apiGet<any>(endpoints.admin.userHistory(id))
    if (!res.ok) return res
    return {
      ok: true,
      data: {
        user: {
          id: Number(res.data.user.id),
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          createdAt: res.data.user.created_at,
        },
        tickets: res.data.tickets.map(mapTicket),
        payments: res.data.payments.map(mapPayment),
      },
    }
  },
}
