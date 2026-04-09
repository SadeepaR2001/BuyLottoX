import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/auth.store'

function Item({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
          isActive
            ? 'bg-purple-500/15 border border-purple-500/25 shadow-neon'
            : 'text-white/70 hover:text-white hover:bg-white/5',
        ].join(' ')
      }
    >
      <span className="h-2.5 w-2.5 rounded-full bg-purple-400/70 shadow-[0_0_18px_rgba(168,85,247,0.45)]" />
      <span className="font-medium">{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)

  return (
    <aside className="relative hidden h-screen w-72 shrink-0 border-r border-white/10 bg-black/30 px-4 py-5 backdrop-blur lg:block">
      <div className="flex items-center gap-3 px-2">
        <img src="/logo.svg" alt="BuyLottoX" className="h-12 w-12 rounded-xl object-cover shadow-neon" />
        <div>
          <div className="text-lg font-semibold tracking-tight">BuyLottoX</div>
          <div className="text-xs text-white/50">Lottery Platform</div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Item to="/dashboard" label="Dashboard" />
        {user?.role === 'USER' && <Item to="/buy-ticket" label="Buy Ticket" />}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && <Item to="/admin" label="Admin Dashboard" />}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && <Item to="/admin/grids" label="Grid Management" />}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && <Item to="/admin/users" label="Users" />}
      </div>

      {user && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-4 py-4">
          <div className="text-xs text-white/50">Signed in as</div>
          <div className="mt-1 text-sm font-medium">{user.mobileNumber}</div>
          <div className="mt-1 text-xs text-white/40">Role: {user.role}</div>
        </div>
      )}
    </aside>
  )
}
