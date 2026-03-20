import type { ApiResult } from '../../types/shared'
import { apiGet, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type { AuthUser, LoginPayload, RegisterPayload } from './auth.types'

type AuthResponse = { accessToken: string; user: AuthUser }

export const authService = {
  login: (payload: LoginPayload): Promise<ApiResult<AuthResponse>> => apiPost(endpoints.auth.login, payload),
  register: (payload: RegisterPayload): Promise<ApiResult<AuthResponse>> => apiPost(endpoints.auth.register, payload),
  me: (): Promise<ApiResult<AuthUser>> => apiGet(endpoints.auth.me),
  logout: (): Promise<ApiResult<boolean>> => apiPost(endpoints.auth.logout),
}