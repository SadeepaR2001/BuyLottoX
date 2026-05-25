import type { ApiResult } from '../../types/shared'
import { apiGet, apiPatch, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type { CreateTicketPayload, Ticket, TicketStatus } from './tickets.types'

const mapTicket = (row: any): Ticket => ({
  id: Number(row.id),
  ticketCode: row.ticket_code,
  userId: Number(row.user_id),
  drawId: Number(row.draw_id),
  drawTitle: row.draw_title,
  drawAt: row.draw_at,
  ticketPrice: row.ticket_price != null ? Number(row.ticket_price) : undefined,
  numbers: Array.isArray(row.numbers) ? row.numbers : [],
  status: row.status,
  adminNotes: row.admin_notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const ticketsService = {
  async myTickets(): Promise<ApiResult<Ticket[]>> {
    const res = await apiGet<any[]>(endpoints.tickets.mine)
return res.ok ? { ok: true, data: res.data.map(mapTicket), status: res.status } : res
  },
  async create(payload: CreateTicketPayload): Promise<ApiResult<Ticket>> {
    const res = await apiPost<any>(endpoints.tickets.create, payload)
return res.ok ? { ok: true, data: mapTicket(res.data), status: res.status } : res
  },
  async updateStatus(id: number, status: TicketStatus, notes?: string): Promise<ApiResult<Ticket>> {
    const res = await apiPatch<any>(endpoints.tickets.update(id), { status, notes })
return res.ok ? { ok: true, data: mapTicket(res.data), status: res.status } : res  },
}
