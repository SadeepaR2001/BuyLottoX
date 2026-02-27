import type { Role } from '../../types/shared'

export type AuthUser = { id: string; name: string; email: string; role: Role }
export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { name: string; email: string; password: string }
