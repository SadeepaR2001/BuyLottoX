import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/auth.store'
import { Button } from '../ui/Button'

export function Navbar() {
  const { user, logout } = useAuthStore()
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-semibold tracking-tight">BuyLottoX</Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/dashboard" className={({isActive}) => isActive ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}>Dashboard</NavLink>
              <NavLink to="/buy-ticket" className={({isActive}) => isActive ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}>Buy Ticket</NavLink>
              <NavLink to="/my-tickets" className={({isActive}) => isActive ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}>My Tickets</NavLink>
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className={({isActive}) => isActive ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}>Admin</NavLink>
              )}
              <span className="ml-2 text-sm text-slate-600">{user.name}</span>
              <Button variant="ghost" onClick={() => logout()}>Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-slate-600 hover:text-slate-900">Login</NavLink>
              <NavLink to="/register" className="text-slate-600 hover:text-slate-900">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
