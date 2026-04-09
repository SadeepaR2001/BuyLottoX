import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../features/auth/auth.store'
import { Link, useNavigate } from 'react-router-dom'
import { loginSchema } from '../../features/auth/auth.validators'

type FormData = z.infer<typeof loginSchema>

export default function Login() {
  const nav = useNavigate()
  const { login, loading, error, infoMessage, clearMessages } = useAuthStore()

  useEffect(() => {
    clearMessages()
  }, [clearMessages])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobileNumber: '', password: '' },
  })

  const onSubmit = async (data: FormData) => {
    const ok = await login(data.mobileNumber, data.password)
    if (!ok) return

    const currentUser = useAuthStore.getState().user
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') {
      nav('/admin')
    } else {
      nav('/dashboard')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="BuyLottoX" className="h-11 w-11 rounded-xl object-cover shadow-neon" />
        <div>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-white/55">Login using your mobile number</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/50">
        Admin: <b>0770000001</b> / <b>admin123</b> <br />
        Super Admin: <b>0770000000</b> / <b>super123</b>
      </p>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit(onSubmit)}>
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

        {error && <p className="text-sm text-rose-300">{error}</p>}
        {!error && infoMessage && <p className="text-sm text-emerald-300">{infoMessage}</p>}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Signing in…
            </span>
          ) : (
            'Login'
          )}
        </Button>

        <div className="flex items-center justify-between gap-3 text-sm text-white/60">
          <p>
            No account? <Link className="text-purple-300 underline" to="/register">Register</Link>
          </p>
          <Link className="text-purple-300 underline" to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  )
}
