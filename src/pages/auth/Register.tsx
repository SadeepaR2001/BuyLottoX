import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { registerSchema } from '../../features/auth/auth.validators'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../features/auth/auth.store'
import { Link, useNavigate } from 'react-router-dom'

type FormData = z.infer<typeof registerSchema>

export default function Register() {
  const nav = useNavigate()
  const { register: registerUser, sendOtp, resendOtp, verifyOtp, loading, error, infoMessage, user, clearMessages } = useAuthStore()
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    clearMessages()
  }, [clearMessages])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', mobileNumber: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: FormData) => {
    const ok = await registerUser(data.name, data.mobileNumber, data.password)
    if (!ok) return

    const sent = await sendOtp(data.mobileNumber)
    if (sent) {
      setOtpSent(true)
      setCountdown(30)
    }
  }

  const onVerifyOtp = async () => {
    const mobileNumber = getValues('mobileNumber') || user?.mobileNumber
    if (!mobileNumber || !otpCode) return
    const ok = await verifyOtp(mobileNumber, otpCode)
    if (!ok) return
    nav('/dashboard')
  }

  const onResendOtp = async () => {
    const mobileNumber = getValues('mobileNumber') || user?.mobileNumber
    if (!mobileNumber) return
    const ok = await resendOtp(mobileNumber)
    if (!ok) return
    setCountdown(30)
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="BuyLottoX" className="h-11 w-11 rounded-xl object-cover shadow-neon" />
        <div>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-white/55">Register using your mobile number and verify with OTP</p>
        </div>
      </div>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm text-white/70">Name</label>
          <Input placeholder="Your full name" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70">Mobile Number</label>
          <Input placeholder="0771234567" {...register('mobileNumber')} />
          {errors.mobileNumber && <p className="mt-1 text-xs text-rose-300">{errors.mobileNumber.message}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70">Password</label>
          <Input type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70">Confirm Password</label>
          <Input type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="mt-1 text-xs text-rose-300">{errors.confirmPassword.message}</p>}
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}
        {!error && infoMessage && <p className="text-sm text-emerald-300">{infoMessage}</p>}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? (
            <span className="inline-flex items-center gap-2"><Spinner /> Creating account…</span>
          ) : (
            'Register'
          )}
        </Button>
      </form>

      {otpSent && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Verify OTP</h2>
          <p className="mt-1 text-sm text-white/55">Enter the code sent to your mobile number.</p>
          <div className="mt-3 space-y-3">
            <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit OTP" maxLength={6} />
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => void onVerifyOtp()} disabled={loading || !otpCode}>Verify OTP</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void onResendOtp()}
                disabled={loading || countdown > 0}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-white/60">
        Already have an account? <Link className="text-purple-300 underline" to="/login">Login</Link>
      </p>
    </div>
  )
}
