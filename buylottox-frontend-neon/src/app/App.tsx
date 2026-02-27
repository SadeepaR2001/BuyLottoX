import { useEffect } from 'react'
import { RouterProvider } from './providers/RouterProvider'
import { useAuthStore } from '../features/auth/auth.store'
import '../styles/index.css'

export default function App() {
  const load = useAuthStore(s => s.loadFromStorage)

  useEffect(() => { void load() }, [load])

  return <RouterProvider />
}
