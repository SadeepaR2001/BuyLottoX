import axios from 'axios'
import type { ApiResult } from '../../types/shared'
import { storage } from '../../utils/storage'

const TOKEN_KEY = 'blx_token'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

console.log('API URL:', import.meta.env.VITE_API_URL)

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
    return error.response?.data?.error || error.message || 'Request failed'
  }
  return 'Request failed'
}

export async function apiGet<T>(url: string): Promise<ApiResult<T>> {
  try {
    const { data } = await http.get<ApiResult<T>>(url)
    return data
  } catch (error) {
    return { ok: false, error: fallbackError(error) }
  }
}

export async function apiPost<T>(
  url: string,
  payload?: unknown,
  headers?: Record<string, string>
): Promise<ApiResult<T>> {
  try {
    console.log('🌐 API REQUEST:', url, payload)
    const res = await http.post<T>(url, payload, { headers })
    //const { data } = await http.post<ApiResult<T>>(url, payload, { headers })
    //console.log('🌐 API SUCCESS RESPONSE:', data)
    return {
      ok: true,
      data: res.data,
      status: res.status,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        error: fallbackError(error),
        status: error.response?.status,
      }
    }

    return {
      ok: false,
      error: 'Request failed',
    }
  }
}

export async function apiPatch<T>(url: string, payload?: unknown): Promise<ApiResult<T>> {
  try {
    console.log('🌐 API REQUEST:', url, payload)
    const { data } = await http.patch<ApiResult<T>>(url, payload)
    console.log('🌐 API SUCCESS RESPONSE:', data)
    return data
  } catch (error) {
    console.log('🌐 API ERROR:', error)
    return { ok: false, error: fallbackError(error) }
  }
}