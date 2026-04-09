import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import type { Role } from '../types/shared'
import { useAuthStore } from '../features/auth/auth.store'

export function RoleRoute({ allow, children }: PropsWithChildren<{ allow: Role[] }>) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!allow.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
