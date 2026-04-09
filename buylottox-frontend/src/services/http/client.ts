import axios from 'axios'
import type { ApiResult } from '../../types/shared'
import { storage } from '../../utils/storage'

const TOKEN_KEY = 'blx_token'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

http.interceptors.request.use((config) => {
  const token = storage.get<string>(TOKEN_KEY)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function fallbackError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any
    if (typeof data?.message === 'string') return data.message
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.error === 'string') return data.error
    return error.message || 'Request failed'
  }
  return 'Request failed'
}

function okWrap<T>(data: T, status: number): ApiResult<T> {
  return { ok: true, data, status }
}

export async function apiGet<T>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await http.get<T>(url)
    return okWrap(res.data, res.status)
  } catch (error) {
    return { ok: false, error: fallbackError(error), status: axios.isAxiosError(error) ? error.response?.status : undefined }
  }
}

export async function apiPost<T>(url: string, payload?: unknown, headers?: Record<string, string>): Promise<ApiResult<T>> {
  try {
    const res = await http.post<T>(url, payload, { headers })
    return okWrap(res.data, res.status)
  } catch (error) {
    return { ok: false, error: fallbackError(error), status: axios.isAxiosError(error) ? error.response?.status : undefined }
  }
}

export async function apiPatch<T>(url: string, payload?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await http.patch<T>(url, payload)
    return okWrap(res.data, res.status)
  } catch (error) {
    return { ok: false, error: fallbackError(error), status: axios.isAxiosError(error) ? error.response?.status : undefined }
  }
}
