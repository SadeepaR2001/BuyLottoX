import { z } from 'zod'

const sriLankaMobileRegex = /^(94|0)?7\d{8}$/
const otpRegex = /^\d{4,6}$/

export const loginSchema = z.object({
  mobileNumber: z.string().regex(sriLankaMobileRegex, 'Invalid Sri Lankan mobile number'),
  password: z.string().min(6),
})

export const registerSchema = z
  .object({
    name: z.string().min(2),
    mobileNumber: z.string().regex(sriLankaMobileRegex, 'Invalid Sri Lankan mobile number'),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  mobileNumber: z.string().regex(sriLankaMobileRegex, 'Invalid Sri Lankan mobile number'),
})

export const otpOnlySchema = z.object({
  code: z.string().regex(otpRegex, 'Enter a valid OTP code'),
})

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
