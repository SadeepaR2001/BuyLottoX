import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAuthStore } from '../features/auth/auth.store'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const isAuthed = useAuthStore(s => s.isAuthenticated)
  if (!isAuthed) return <Navigate to="/login" replace />
  return <>{children}</>
}
