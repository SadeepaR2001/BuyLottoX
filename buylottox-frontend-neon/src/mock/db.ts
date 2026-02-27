import type { Role } from '../types/shared'

export type MockUser = {
  id: string
  name: string
  email: string
  password: string
  role: Role
}

export type MockDraw = {
  id: string
  title: string
  drawAt: string
  status: 'OPEN' | 'CLOSED'
  winningNumbers?: number[]
}

export type MockTicket = {
  id: string
  userId: string
  drawId: string
  numbers: number[]
  status: 'PENDING' | 'WON' | 'LOST'
  createdAt: string
}

export const db = {
  users: [
    { id: 'u_admin', name: 'Admin', email: 'admin@buylottox.test', password: 'admin123', role: 'ADMIN' as Role },
    { id: 'u_user', name: 'User', email: 'user@buylottox.test', password: 'user1234', role: 'USER' as Role },
  ] as MockUser[],
  draws: [
    { id: 'd1', title: 'Weekly Draw', drawAt: '2026-02-19T08:20:07Z', status: 'OPEN' as const },
  ] as MockDraw[],
  tickets: [] as MockTicket[],
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}
