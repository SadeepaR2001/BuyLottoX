export type PaymentMethod = 'BANK_TRANSFER' | 'ONLINE_TRANSFER' | 'DIRECT_BANK_TRANSFER'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
export type TicketPurchaseStatus = 'RESERVED' | 'PAYMENT_PENDING' | 'PROCESSING' | 'REJECTED' | 'COMPLETED'

export type PaymentSubTicket = {
  id: string
  subIndex: number
  status: string
  gridNumber?: { id: string; number: number }
}

export type PurchaseSummary = {
  id: string
  gridId: string
  status: TicketPurchaseStatus
  totalAmount: number
  grid?: { id: string; title: string }
  subTickets: PaymentSubTicket[]
}

export type RafflePurchaseSummary = {
  id: string
  raffleId: string
  status: TicketPurchaseStatus
  totalAmount: number
  raffle?: { id: string; title: string; imageUrl?: string | null; ticketPrice?: number }
  tickets: { id: string; number: number; status: string }[]
}

export type Payment = {
  id: string
  purchaseId?: string | null
  rafflePurchaseId?: string | null
  userId: string
  reference: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  slipPath?: string | null
  adminNote?: string | null
  rejectionReason?: string | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt?: string
  user?: { id: string; name: string; mobileNumber: string }
  purchase?: PurchaseSummary
  rafflePurchase?: RafflePurchaseSummary
}

export type CreatePaymentPayload = {
  purchaseId?: string
  rafflePurchaseId?: string
  paymentMethod?: PaymentMethod
}
