import { db, uid } from './db'
import type { ApiResult } from '../types/shared'

export type Ticket = {
  id: string
  drawId: string
  numbers: number[]
  status: 'PENDING' | 'WON' | 'LOST'
  createdAt: string
}

export type CreateTicketPayload = { userId: string; drawId: string; numbers: number[] }

export async function myTickets(userId: string): Promise<ApiResult<Ticket[]>> {
  await sleep(200)
  const items = db.tickets.filter(t => t.userId === userId).map(strip)
return { ok: true, data: items.sort((a,b)=> b.createdAt.localeCompare(a.createdAt)), status: 200 }}

export async function createTicket(payload: CreateTicketPayload): Promise<ApiResult<Ticket>> {
  await sleep(250)
  const ticket = {
    id: uid('t'),
    userId: payload.userId,
    drawId: payload.drawId,
    numbers: payload.numbers,
    status: 'PENDING' as const,
    createdAt: new Date().toISOString(),
  }
  db.tickets.push(ticket)
return { ok: true, data: strip(ticket), status: 200 }
}

function strip(t: any): Ticket {
  return { id: t.id, drawId: t.drawId, numbers: t.numbers, status: t.status, createdAt: t.createdAt }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
