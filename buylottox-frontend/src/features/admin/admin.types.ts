import type { Role } from '../../types/shared'

export type AdminUser = {
  id: string
  name: string
  mobileNumber: string
  role: Role
  status: 'ACTIVE' | 'BLOCKED'
  createdAt: string
}

export type GridStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED'

export type AdminGrid = {
  id: string
  title: string
  openAt: string
  closeAt: string
  subTicketPrice: number
  commissionRate: number
  totalValue: number
  commissionAmount: number
  winningPool: number
  winningNumber: number | null
  status: GridStatus
  createdAt: string
  updatedAt: string
  numbersCount?: number
  purchasesCount?: number
}

export type GridDetail = AdminGrid & {
  numbers: Array<{
    id: string
    number: number
    isSoldOut: boolean
    subTickets: Array<{
      id: string
      subIndex: number
      status: 'AVAILABLE' | 'SOLD'
      soldAt: string | null
    }>
  }>
}

export type CreateGridPayload = {
  title: string
  openAt: string
  closeAt: string
  subTicketPrice: number
  commissionRate: number
  subTicketsPerMain: number
}
