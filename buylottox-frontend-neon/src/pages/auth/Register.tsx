import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '../../features/auth/auth.validators'
import type { z } from 'zod'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../features/auth/auth.store'
import { Link, useNavigate } from 'react-router-dom'

type FormData = z.infer<typeof registerSchema>

export default function Register() {
  const nav = useNavigate()
  const { register: doRegister, loading, error } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: FormData) => {
    const ok = await doRegister(data.name, data.email, data.password)
    if (ok) nav('/dashboard')
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <img src="/logo.jpg" alt="BuyLottoX" className="h-11 w-11 rounded-xl object-cover shadow-neon" />
        <div>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-white/55">Start buying tickets in seconds</p>
        </div>
      </div>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm text-white/70">Name</label>
          <Input placeholder="Your name" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70">Email</label>
          <Input placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-rose-300">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70">Password</label>
          <Input type="password" placeholder="Min 6 chars" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70">Confirm password</label>
          <Input type="password" placeholder="Repeat password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="mt-1 text-xs text-rose-300">{errors.confirmPassword.message}</p>}
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Creating…</span> : 'Register'}
        </Button>

        <p className="text-sm text-white/60">
          Already have an account? <Link className="text-purple-300 underline" to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
