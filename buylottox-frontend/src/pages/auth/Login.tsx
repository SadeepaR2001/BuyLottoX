import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../../features/auth/auth.validators'
import type { z } from 'zod'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../features/auth/auth.store'
import { Link, useNavigate } from 'react-router-dom'

type FormData = z.infer<typeof loginSchema>

export default function Login() {
  const nav = useNavigate()
  const { login, loading, error } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    //resolver: zodResolver(loginSchema),
    //defaultValues: { email: 'user@buylottox.test', password: 'user1234' },
  })

  const onSubmit = async (data: FormData) => {
    console.log('LOGIN SUBMIT:', data)

    const ok = await login(data.email, data.password)
    console.log('LOGIN RESULT:', ok) 

    if (ok) nav('/dashboard')
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="BuyLottoX" className="h-11 w-11 rounded-xl object-cover shadow-neon" />
        <div>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-white/55">Login to BuyLottoX</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/50">
        Demo: <b>user@buylottox.test</b> / <b>user1234</b> <br />
        Admin: <b>admin@buylottox.test</b> / <b>admin123</b>
      </p>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm text-white/70">Email</label>
          <Input placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-rose-300">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70">Password</label>
          <Input type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p>}
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Signing in…</span> : 'Login'}
        </Button>

        <p className="text-sm text-white/60">
          No account? <Link className="text-purple-300 underline" to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}