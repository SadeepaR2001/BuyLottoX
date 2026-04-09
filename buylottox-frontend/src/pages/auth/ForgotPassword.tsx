import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../features/auth/auth.store'
import { forgotPasswordSchema, otpOnlySchema, resetPasswordSchema } from '../../features/auth/auth.validators'

type MobileFormData = z.infer<typeof forgotPasswordSchema>
type OtpFormData = z.infer<typeof otpOnlySchema>
type ResetFormData = z.infer<typeof resetPasswordSchema>

export default function ForgotPassword() {
  const nav = useNavigate()
  const { sendForgotPasswordOtp, verifyForgotPasswordOtp, resendOtp, resetPassword, loading, error, infoMessage, clearMessages } = useAuthStore()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [countdown, setCountdown] = useState(0)
  const [mobileNumber, setMobileNumber] = useState('')
  const [verifiedCode, setVerifiedCode] = useState('')

  useEffect(() => {
    clearMessages()
  }, [clearMessages])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const mobileForm = useForm<MobileFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { mobileNumber: '' },
  })

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpOnlySchema),
    defaultValues: { code: '' },
  })

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const handleSendOtp = async (data: MobileFormData) => {
    const ok = await sendForgotPasswordOtp(data.mobileNumber)
    if (!ok) return
    setMobileNumber(data.mobileNumber)
    setStep(2)
    setCountdown(30)
  }

  const handleVerifyOtp = async (data: OtpFormData) => {
    const ok = await verifyForgotPasswordOtp(mobileNumber, data.code)
    if (!ok) return
    setVerifiedCode(data.code)
    setStep(3)
  }

  const handleResendOtp = async () => {
    const ok = await resendOtp(mobileNumber)
    if (!ok) return
    setCountdown(30)
  }

  const handleResetPassword = async (data: ResetFormData) => {
    const ok = await resetPassword(mobileNumber, verifiedCode, data.newPassword)
    if (!ok) return
    nav('/login')
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="BuyLottoX" className="h-11 w-11 rounded-xl object-cover shadow-neon" />
        <div>
          <h1 className="text-xl font-semibold">Forgot password</h1>
          <p className="text-sm text-white/55">Reset your account password using an OTP sent to your mobile number.</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-white/50">
        <span className={step >= 1 ? 'text-purple-300' : ''}>1. Send OTP</span>
        <span>•</span>
        <span className={step >= 2 ? 'text-purple-300' : ''}>2. Verify OTP</span>
        <span>•</span>
        <span className={step >= 3 ? 'text-purple-300' : ''}>3. Reset password</span>
      </div>

      {step === 1 && (
        <form className="mt-6 space-y-3" onSubmit={mobileForm.handleSubmit(handleSendOtp)}>
          <div>
            <label className="text-sm text-white/70">Mobile Number</label>
            <Input placeholder="0771234567" {...mobileForm.register('mobileNumber')} />
            {mobileForm.formState.errors.mobileNumber && (
              <p className="mt-1 text-xs text-rose-300">{mobileForm.formState.errors.mobileNumber.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}
          {!error && infoMessage && <p className="text-sm text-emerald-300">{infoMessage}</p>}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Sending OTP…</span> : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="mt-6 space-y-3" onSubmit={otpForm.handleSubmit(handleVerifyOtp)}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
            OTP sent to <span className="font-medium text-white">{mobileNumber}</span>
          </div>

          <div>
            <label className="text-sm text-white/70">OTP Code</label>
            <Input placeholder="Enter OTP" maxLength={6} {...otpForm.register('code')} />
            {otpForm.formState.errors.code && (
              <p className="mt-1 text-xs text-rose-300">{otpForm.formState.errors.code.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}
          {!error && infoMessage && <p className="text-sm text-emerald-300">{infoMessage}</p>}

          <div className="flex flex-wrap gap-3">
            <Button disabled={loading} type="submit">
              {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Verifying…</span> : 'Verify OTP'}
            </Button>
            <Button type="button" variant="secondary" disabled={loading || countdown > 0} onClick={() => void handleResendOtp()}>
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="mt-6 space-y-3" onSubmit={resetForm.handleSubmit(handleResetPassword)}>
          <div>
            <label className="text-sm text-white/70">New Password</label>
            <Input type="password" placeholder="••••••••" {...resetForm.register('newPassword')} />
            {resetForm.formState.errors.newPassword && (
              <p className="mt-1 text-xs text-rose-300">{resetForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-white/70">Confirm Password</label>
            <Input type="password" placeholder="••••••••" {...resetForm.register('confirmPassword')} />
            {resetForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-300">{resetForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}
          {!error && infoMessage && <p className="text-sm text-emerald-300">{infoMessage}</p>}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Resetting…</span> : 'Reset Password'}
          </Button>
        </form>
      )}

      <p className="mt-4 text-sm text-white/60">
        Remembered your password? <Link className="text-purple-300 underline" to="/login">Back to login</Link>
      </p>
    </div>
  )
}
