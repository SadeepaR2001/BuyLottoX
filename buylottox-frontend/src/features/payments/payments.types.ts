export type PaymentMethod = 'BANK_TRANSFER' | 'CARD' | 'CASH_DEPOSIT'
export type PaymentStatus = 'PENDING' | 'SLIP_UPLOADED' | 'APPROVED' | 'REJECTED'

export type Payment = {
  id: number
  userId: number
  ticketId?: number | null
  ticketCode?: string | null
  amount: number
  method: PaymentMethod
  referenceNo?: string | null
  slipPath?: string | null
  status: PaymentStatus
  adminNotes?: string | null
  createdAt: string
  updatedAt?: string
  userName?: string
  userEmail?: string
}

export type CreatePaymentPayload = {
  ticketId: number
  amount: number
  method: PaymentMethod
  referenceNo?: string
}
