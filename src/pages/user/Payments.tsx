import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { usePaymentsStore } from '../../features/payments/payments.store'
import type { Payment } from '../../features/payments/payments.types'
import { formatDateTime } from '../../utils/date'
import { formatMoney } from '../../utils/money'

type BuyNavigationState = {
  purchaseId?: string
  rafflePurchaseId?: string
  totalAmount?: number
  totalSubTickets?: number
  totalRaffleTickets?: number
  gridId?: string
  gridTitle?: string
  raffleId?: string
  raffleTitle?: string
}

const bankAccounts = [
  {
    bankName: 'SAMPATH BANK PLC',
    accountName: 'Kasun Yapa',
    accountNumber: '1179 5288 2963',
    branch: 'AKURESSA BRANCH',
  },
  {
    bankName: 'COMMERCIAL BANK',
    accountName: 'KASUN YAPA',
    accountNumber: '8120068934',
    branch: 'AKURESSA BRANCH',
  },
]

function toneForStatus(status: Payment['status']) {
  if (status === 'COMPLETED' || status === 'APPROVED') return 'green'
  if (status === 'REJECTED') return 'red'
  return 'yellow'
}

function paymentTitle(payment: Payment) {
  if (payment.rafflePurchase) return `Raffle: ${payment.rafflePurchase.raffle?.title ?? 'Raffle Draw'}`
  return `Grid: ${payment.purchase?.grid?.title ?? 'Grid Ticket'}`
}

function paymentTicketText(payment: Payment) {
  if (payment.rafflePurchase) return payment.rafflePurchase.tickets.map((ticket) => `Raffle #${ticket.number}`).join(', ') || '—'
  return payment.purchase?.subTickets?.map((sub) => `${sub.gridNumber?.number}-${sub.subIndex}`).join(', ') || '—'
}

export default function Payments() {
  const location = useLocation()
  const navigate = useNavigate()
  const navState = (location.state || {}) as BuyNavigationState
  const purchaseIdFromState = navState.purchaseId
  const rafflePurchaseIdFromState = navState.rafflePurchaseId
  const isBuyPaymentFlow = Boolean(purchaseIdFromState || rafflePurchaseIdFromState)
  const { mine, fetchMine, createPayment, uploadSlip, loading, error } = usePaymentsStore()
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localMessage, setLocalMessage] = useState<string | null>(null)

  useEffect(() => {
    void fetchMine()
  }, [fetchMine])

  useEffect(() => {
    const flowId = purchaseIdFromState || rafflePurchaseIdFromState
    if (!flowId) return

    const existing = mine.find((payment) => {
      if (purchaseIdFromState) return payment.purchaseId === purchaseIdFromState
      return payment.rafflePurchaseId === rafflePurchaseIdFromState
    })
    if (existing) {
      setActivePaymentId(existing.id)
      return
    }

    void (async () => {
      const created = await createPayment({
        purchaseId: purchaseIdFromState,
        rafflePurchaseId: rafflePurchaseIdFromState,
        paymentMethod: 'BANK_TRANSFER',
      })
      if (created) {
        setActivePaymentId(created.id)
        setLocalMessage('Payment request created. Complete payment and upload the slip to reserve your selected tickets.')
      }
    })()
  }, [purchaseIdFromState, rafflePurchaseIdFromState, mine, createPayment])

  const activePayment = useMemo(() => {
    if (!isBuyPaymentFlow) return null
    if (activePaymentId) return mine.find((payment) => payment.id === activePaymentId) || null
    if (purchaseIdFromState) return mine.find((payment) => payment.purchaseId === purchaseIdFromState) || null
    if (rafflePurchaseIdFromState) return mine.find((payment) => payment.rafflePurchaseId === rafflePurchaseIdFromState) || null
    return null
  }, [activePaymentId, isBuyPaymentFlow, mine, purchaseIdFromState, rafflePurchaseIdFromState])

  const historyPayments = useMemo(() => {
    return mine.filter((payment) => payment.slipPath || payment.status === 'PROCESSING' || payment.status === 'COMPLETED' || payment.status === 'REJECTED')
  }, [mine])

  const submitSlip = async () => {
    if (!activePayment || !selectedFile) return
    const ok = await uploadSlip(activePayment.id, selectedFile)
    if (ok) {
      setSelectedFile(null)
      setLocalMessage('Payment slip uploaded successfully. Your selected tickets are now reserved and pending admin approval.')
      await fetchMine()
      navigate('/payments', { replace: true })
    }
  }

  const historyBox = (
    <div className="blx-panel p-6">
      <h2 className="text-lg font-semibold">Payment History / Previous Activity</h2>
      <p className="mt-1 text-sm text-white/55">Your previous grid and raffle payments are shown here.</p>
      <div className="mt-4 space-y-3">
        {historyPayments.map((payment) => (
          <div key={payment.id} className="w-full rounded-2xl border border-white/10 p-4 text-left">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium">{payment.reference}</div>
                <div className="mt-1 text-xs text-white/45">{formatDateTime(payment.createdAt)}</div>
                <div className="mt-2 text-sm text-white/60">{paymentTitle(payment)}</div>
                <div className="mt-1 text-sm text-white/60">Tickets: {paymentTicketText(payment)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-semibold">{formatMoney(payment.amount)}</div>
                <Badge tone={toneForStatus(payment.status) as any}>{payment.status}</Badge>
              </div>
            </div>
          </div>
        ))}
        {historyPayments.length === 0 && <div className="text-sm text-white/50">No payment history yet.</div>}
      </div>
    </div>
  )

  if (!isBuyPaymentFlow) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Payment History</h1>
          <p className="mt-1 text-sm text-white/55">Only your previous payment records are shown here.</p>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {historyBox}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Complete Payment</h1>
        <p className="mt-1 text-sm text-white/55">Deposit to one of the bank accounts below or scan the QR, then upload your payment proof. Tickets are reserved only after you upload the payment slip, and confirmed after admin approval.</p>
      </div>

      {(error || localMessage) && (
        <div className="space-y-2">
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {localMessage && <p className="text-sm text-emerald-300">{localMessage}</p>}
        </div>
      )}

      {activePayment ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="blx-panel p-6 space-y-5">
            <div>
              <div className="text-sm text-white/55">Payment Reference</div>
              <div className="mt-2 text-2xl font-semibold tracking-wide">{activePayment.reference}</div>
              <p className="mt-2 text-sm text-white/60">Include this exact reference in your bank transfer description or payment note.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-xs text-white/50">Total Due</div>
                <div className="mt-2 text-xl font-semibold">{formatMoney(activePayment.amount)}</div>
                <div className="mt-2"><Badge tone={toneForStatus(activePayment.status) as any}>{activePayment.status}</Badge></div>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-xs text-white/50">Purchase</div>
                <div className="mt-2 text-sm text-white/70">{paymentTitle(activePayment)}</div>
                <div className="mt-1 text-sm text-white/70">Purchase ID: {activePayment.purchaseId || activePayment.rafflePurchaseId}</div>
                <div className="mt-1 text-sm text-white/70">Created: {formatDateTime(activePayment.createdAt)}</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-4">
              <h2 className="text-lg font-semibold">Selected Tickets</h2>
              <div className="mt-3 grid gap-2 text-sm text-white/70 md:grid-cols-2">
                {(activePayment.rafflePurchase?.tickets || []).map((ticket) => (
                  <div key={ticket.id} className="rounded-lg bg-white/5 px-3 py-2">Raffle Ticket #{ticket.number}</div>
                ))}
                {(activePayment.purchase?.subTickets || []).map((subTicket) => (
                  <div key={subTicket.id} className="rounded-lg bg-white/5 px-3 py-2">Number {subTicket.gridNumber?.number}-{subTicket.subIndex}</div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-4 space-y-4">
              <h2 className="text-lg font-semibold">Bank Transfer Details</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {bankAccounts.map((account) => (
                  <div key={account.accountNumber} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-1">
                    <div className="text-sm text-white/70">Bank: {account.bankName}</div>
                    <div className="text-sm text-white/70">Account Name: {account.accountName}</div>
                    <div className="text-sm text-white/70">Account Number: {account.accountNumber}</div>
                    <div className="text-sm text-white/70">Branch: {account.branch}</div>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-sm text-amber-200">After payment, upload a clear screenshot or photo of the payment slip. Tickets are not reserved until the slip is uploaded.</div>
            </div>
          </div>

          <div className="blx-panel p-6 space-y-4">
            <h2 className="text-lg font-semibold">Scan & Pay QR</h2>
            <img src="/payment-qr.jpg" alt="Payment QR" className="w-full rounded-2xl border border-white/10 bg-white p-2" />
            <div className="text-sm text-white/60">Other iPay users can scan this QR code to send money to your bank account.</div>

            <h2 className="pt-3 text-lg font-semibold">Upload Payment Slip</h2>
            <Input type="file" accept="image/*,.pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            {activePayment.slipPath && (
              <div className="text-sm text-white/70">Current slip: <a className="text-purple-300 underline" href={`${import.meta.env.VITE_API_URL}${activePayment.slipPath}`} target="_blank" rel="noreferrer">Open uploaded slip</a></div>
            )}
            {activePayment.rejectionReason && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">Rejection reason: {activePayment.rejectionReason}</div>}
            {activePayment.adminNote && <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Admin note: {activePayment.adminNote}</div>}
            <Button className="w-full" disabled={loading || !selectedFile} onClick={() => void submitSlip()}>{loading ? 'Uploading…' : 'Upload Slip'}</Button>
          </div>
        </div>
      ) : (
        <div className="blx-panel p-6 text-sm text-white/60">Creating payment request…</div>
      )}
    </div>
  )
}
