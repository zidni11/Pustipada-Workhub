import type { ApiErrorPayload } from '../types/api'

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(
  /\/$/,
  '',
)

const TOKEN_KEY = 'pustipada_workhub_token'

export const UNAUTHORIZED_EVENT = 'workhub:unauthorized'

export class ApiError extends Error {
  readonly status: number
  readonly errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token)
    } else {
      window.localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // localStorage bisa tidak tersedia (private mode); abaikan.
  }
}

export function toQueryString<T extends object>(params: T): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    search.set(key, String(value))
  }

  const query = search.toString()

  return query ? `?${query}` : ''
}

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { body, auth = true, headers: rawHeaders, ...rest } = init

  const headers = new Headers(rawHeaders)
  headers.set('Accept', 'application/json')

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()

  if (auth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Pastikan backend berjalan.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorPayload = isApiErrorPayload(payload) ? payload : null

    if (response.status === 401) {
      setToken(null)
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    throw new ApiError(
      response.status,
      errorPayload?.message ?? defaultMessageFor(response.status),
      errorPayload?.errors,
    )
  }

  return payload as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Terjadi kesalahan yang tidak diketahui.'
}

function isApiErrorPayload(payload: unknown): payload is ApiErrorPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  )
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 401:
      return 'Sesi Anda berakhir. Silakan masuk kembali.'
    case 403:
      return 'Anda tidak memiliki akses untuk aksi ini.'
    case 404:
      return 'Data tidak ditemukan.'
    case 422:
      return 'Data yang dikirim tidak valid.'
    case 429:
      return 'Terlalu banyak percobaan. Coba lagi sebentar lagi.'
    default:
      return 'Terjadi kesalahan pada server.'
  }
}
