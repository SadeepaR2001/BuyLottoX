import { data } from '../../services/data'
import type { CreateTicketPayload } from './tickets.types'

export const ticketsService = {
  myTickets: (userId: string) => data.tickets.myTickets(userId),
  create: (userId: string, payload: CreateTicketPayload) =>
    data.tickets.createTicket({ userId, drawId: payload.drawId, numbers: payload.numbers }),
}
