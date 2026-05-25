import type { Role } from '../../types/shared'

export type AuthUser = {
  id: string
  name: string
  mobileNumber: string
  role: Role
  status?: string
  isMobileVerified?: boolean
}

export type LoginPayload = { mobileNumber: string; password: string }
export type RegisterPayload = { name: string; mobileNumber: string; password: string }
export type ForgotPasswordSendOtpPayload = { mobileNumber: string }
export type VerifyOtpPayload = { mobileNumber: string; code: string }
export type ResetPasswordPayload = { mobileNumber: string; code: string; newPassword: string }
