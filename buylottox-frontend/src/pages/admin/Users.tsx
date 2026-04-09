import { useEffect, useMemo, useState } from 'react'
import { adminService } from '../../features/admin/admin.service'
import type { AdminUser } from '../../features/admin/admin.types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatDateTime } from '../../utils/date'
import { useAuthStore } from '../../features/auth/auth.store'

export default function Users() {
  const currentUser = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [newAdmin, setNewAdmin] = useState({ name: '', mobileNumber: '', password: '' })

  const loadUsers = async () => {
    setLoading(true)
    const res = await adminService.listUsers()
    if (!res.ok) {
      setError(res.error)
      setLoading(false)
      return
    }
    setUsers(res.data)
    setLoading(false)
  }

  useEffect(() => { void loadUsers() }, [])

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return users
    return users.filter((u) => `${u.name} ${u.mobileNumber} ${u.role} ${u.status}`.toLowerCase().includes(q))
  }, [users, query])

  const mutateUser = async (action: 'block' | 'unblock' | 'makeAdmin' | 'removeAdmin', user: AdminUser) => {
    setError(null)
    setMessage(null)
    let res
    if (action === 'block') res = await adminService.blockUser(user.id)
    else if (action === 'unblock') res = await adminService.unblockUser(user.id)
    else if (action === 'makeAdmin') res = await adminService.makeAdmin(user.id)
    else res = await adminService.removeAdmin(user.id)
    if (!res.ok) return setError(res.error)
    setMessage('User updated successfully')
    await loadUsers()
  }

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const res = await adminService.createAdmin(newAdmin)
    if (!res.ok) return setError(res.error)
    setMessage('Admin created successfully')
    setNewAdmin({ name: '', mobileNumber: '', password: '' })
    await loadUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-white/55">Block users and manage admin roles.</p>
        </div>
        <div className="w-full md:w-80"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" /></div>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      {currentUser?.role === 'SUPER_ADMIN' && (
        <div className="blx-panel p-6">
          <h2 className="text-lg font-semibold">Create Admin</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={createAdmin}>
            <Input placeholder="Name" value={newAdmin.name} onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Mobile Number" value={newAdmin.mobileNumber} onChange={(e) => setNewAdmin((p) => ({ ...p, mobileNumber: e.target.value }))} />
            <Input type="password" placeholder="Password" value={newAdmin.password} onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))} />
            <Button type="submit">Create Admin</Button>
          </form>
        </div>
      )}

      <div className="blx-panel p-6">
        <div className="space-y-4">
          {rows.map((u) => (
            <div key={u.id} className="rounded-2xl border border-white/10 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="mt-1 text-sm text-white/55">{u.mobileNumber}</div>
                  <div className="mt-1 text-xs text-white/40">Joined {formatDateTime(u.createdAt)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={u.role === 'SUPER_ADMIN' ? 'purple' : u.role === 'ADMIN' ? 'yellow' : 'gray'}>{u.role}</Badge>
                  <Badge tone={u.status === 'ACTIVE' ? 'green' : 'red'}>{u.status}</Badge>
                  {u.status === 'ACTIVE' ? (
                    <Button variant="secondary" onClick={() => void mutateUser('block', u)} disabled={loading || u.role === 'SUPER_ADMIN'}>Block</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => void mutateUser('unblock', u)} disabled={loading}>Unblock</Button>
                  )}
                  {currentUser?.role === 'SUPER_ADMIN' && u.role === 'USER' && (
                    <Button onClick={() => void mutateUser('makeAdmin', u)} disabled={loading}>Make Admin</Button>
                  )}
                  {currentUser?.role === 'SUPER_ADMIN' && u.role === 'ADMIN' && (
                    <Button variant="secondary" onClick={() => void mutateUser('removeAdmin', u)} disabled={loading}>Remove Admin</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 && <p className="text-sm text-white/55">No users found.</p>}
        </div>
      </div>
    </div>
  )
}
