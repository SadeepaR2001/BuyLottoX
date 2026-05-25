export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export type ApiSuccess<T> = { ok: true; data: T; status: number }
export type ApiFailure = { ok: false; error: string; status?: number }
export type ApiResult<T> = ApiSuccess<T> | ApiFailure
