import { data } from '../../services/data'
import type { LoginPayload, RegisterPayload } from './auth.types'

export const authService = {
  login: (payload: LoginPayload) => data.auth.login(payload),
  register: (payload: RegisterPayload) => data.auth.register(payload),
  me: (token: string | null) => data.auth.me(token),
  logout: () => data.auth.logout(),
}
