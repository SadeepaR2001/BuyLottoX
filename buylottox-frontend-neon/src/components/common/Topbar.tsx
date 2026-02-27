import { Link } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/auth.store'
import { Button } from '../ui/Button'

export function Topbar() {
  const { user, logout } = useAuthStore()
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:max-w-none lg:px-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="BuyLottoX" className="h-9 w-9 rounded-xl object-cover shadow-neon lg:hidden" />
            <span className="text-sm font-semibold tracking-tight">BuyLottoX</span>
          </Link>
          <span className="hidden text-xs text-white/40 md:inline">Play smart • Win big</span>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-white/70 md:inline">{user.name}</span>
              <Button variant="ghost" onClick={() => logout()}>Logout</Button>
            </>
          ) : (
            <>
              <Link className="blx-btn-ghost" to="/login">Login</Link>
              <Link className="blx-btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
