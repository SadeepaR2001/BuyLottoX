import type { ApiResult } from '../../types/shared'
import { apiGet, apiPost } from '../../services/http/client'
import { endpoints } from '../../services/http/endpoints'
import type {
  AuthUser,
  ForgotPasswordSendOtpPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from './auth.types'

type AuthResponse = { accessToken: string; user: AuthUser }

export const authService = {
  login: (payload: LoginPayload): Promise<ApiResult<AuthResponse>> => apiPost(endpoints.auth.login, payload),
  register: (payload: RegisterPayload): Promise<ApiResult<AuthResponse>> => apiPost(endpoints.auth.register, payload),
  me: (): Promise<ApiResult<AuthUser>> => apiGet(endpoints.auth.me),
  sendOtp: (mobileNumber: string): Promise<ApiResult<{ message: string }>> => apiPost(endpoints.auth.sendOtp, { mobileNumber }),
  verifyOtp: (mobileNumber: string, code: string): Promise<ApiResult<{ message: string }>> =>
    apiPost(endpoints.auth.verifyOtp, { mobileNumber, code } satisfies VerifyOtpPayload),
  resendOtp: (mobileNumber: string): Promise<ApiResult<{ message: string }>> =>
    apiPost(endpoints.auth.resendOtp, { mobileNumber }),
  sendForgotPasswordOtp: (payload: ForgotPasswordSendOtpPayload): Promise<ApiResult<{ message: string }>> =>
    apiPost(endpoints.auth.forgotPasswordSendOtp, payload),
  verifyForgotPasswordOtp: (payload: VerifyOtpPayload): Promise<ApiResult<{ message: string }>> =>
    apiPost(endpoints.auth.forgotPasswordVerifyOtp, payload),
  resetPassword: (payload: ResetPasswordPayload): Promise<ApiResult<{ message: string }>> =>
    apiPost(endpoints.auth.forgotPasswordReset, payload),
}
