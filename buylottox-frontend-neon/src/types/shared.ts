export type Role = 'USER' | 'ADMIN'

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
