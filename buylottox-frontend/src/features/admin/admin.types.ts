import type { Role } from '../../types/shared'
import type { Payment } from '../payments/payments.types'
import type { Ticket } from '../tickets/tickets.types'

export type AdminUser = {
  id: number
  name: string
  email: string
  role: Role
  createdAt: string
  ticketCount: number
  paymentCount: number
  approvedPaymentTotal: number
}

export type AdminUserHistory = {
  user: {
    id: number
    name: string
    email: string
    role: Role
    createdAt: string
  }
  tickets: Ticket[]
  payments: Payment[]
}
