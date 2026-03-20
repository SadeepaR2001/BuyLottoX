export type TicketStatus = 'PENDING_PAYMENT' | 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'WON' | 'LOST'

export type Ticket = {
  id: number
  ticketCode: string
  userId: number
  drawId: number
  drawTitle?: string
  drawAt?: string
  ticketPrice?: number
  numbers: number[]
  status: TicketStatus
  adminNotes?: string | null
  createdAt: string
  updatedAt?: string
}

export type CreateTicketPayload = { drawId: number; numbers: number[] }
