export type Ticket = {
  id: string
  drawId: string
  numbers: number[]
  status: 'PENDING' | 'WON' | 'LOST'
  createdAt: string
}

export type CreateTicketPayload = { drawId: string; numbers: number[] }
