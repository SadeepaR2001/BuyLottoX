import { db, uid } from './db'
import type { ApiResult, Role } from '../types/shared'

export type AuthUser = { id: string; name: string; email: string; role: Role }
export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { name: string; email: string; password: string }

export async function login(payload: LoginPayload): Promise<ApiResult<{ token: string; user: AuthUser }>> {
  await sleep(250)
  const u = db.users.find(x => x.email.toLowerCase() === payload.email.toLowerCase())
  if (!u || u.password !== payload.password) return { ok: false, error: 'Invalid email or password' }
return { ok: true, data: { token: `mock_token_${u.id}`, user: pickUser(u) }, status: 200 }
}

export async function register(payload: RegisterPayload): Promise<ApiResult<{ token: string; user: AuthUser }>> {
  await sleep(250)
  const exists = db.users.some(x => x.email.toLowerCase() === payload.email.toLowerCase())
  if (exists) return { ok: false, error: 'Email already registered' }
  const u = { id: uid('u'), name: payload.name, email: payload.email, password: payload.password, role: 'USER' as Role }
  db.users.push(u)
return { ok: true, data: { token: `mock_token_${u.id}`, user: pickUser(u) }, status: 200 }
}

export async function me(token: string | null): Promise<ApiResult<AuthUser>> {
  await sleep(150)
  if (!token) return { ok: false, error: 'Not authenticated' }
  const id = token.replace('mock_token_', '')
  const u = db.users.find(x => x.id === id)
  if (!u) return { ok: false, error: 'Session expired' }
return { ok: true, data: pickUser(u), status: 200 }
}

export async function logout(): Promise<ApiResult<true>> {
  await sleep(100)
return { ok: true, data: true, status: 200 }
}

function pickUser(u: { id: string; name: string; email: string; role: Role }): AuthUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
