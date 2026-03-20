import type { ApiResult } from '../../types/shared'
import { apiGet, apiPatch, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type { CreateDrawPayload, Draw } from './draws.types'

const mapDraw = (row: any): Draw => ({
  id: Number(row.id),
  title: row.title,
  drawAt: row.draw_at,
  ticketPrice: Number(row.ticket_price),
  jackpotAmount: Number(row.jackpot_amount),
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const drawsService = {
  async getActive(): Promise<ApiResult<Draw>> {
    const res = await apiGet<any>(endpoints.draws.active)
    return res.ok ? { ok: true, data: mapDraw(res.data) } : res
  },
  async listAll(): Promise<ApiResult<Draw[]>> {
    const res = await apiGet<any[]>(endpoints.draws.list)
    return res.ok ? { ok: true, data: res.data.map(mapDraw) } : res
  },
  async create(payload: CreateDrawPayload): Promise<ApiResult<Draw>> {
    const res = await apiPost<any>(endpoints.draws.list, payload)
    return res.ok ? { ok: true, data: mapDraw(res.data) } : res
  },
  async close(id: number): Promise<ApiResult<Draw>> {
    const res = await apiPatch<any>(endpoints.draws.close(id))
    return res.ok ? { ok: true, data: mapDraw(res.data) } : res
  },
}
