export type Draw = {
  id: number
  title: string
  drawAt: string
  ticketPrice: number
  jackpotAmount: number
  status: 'OPEN' | 'CLOSED'
  createdAt?: string
  updatedAt?: string
}

export type CreateDrawPayload = {
  title: string
  drawAt: string
  ticketPrice: number
  jackpotAmount: number
}
