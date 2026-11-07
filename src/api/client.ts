import { readStorage, writeStorage } from '../utils/storage'

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const TOKEN_KEY = 'oakline-token'

export const getToken = () => readStorage(TOKEN_KEY)

export const setToken = (token: string | null) => writeStorage(TOKEN_KEY, token)

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

export async function apiFetch<T>(path: string, { method = 'GET', body }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the server. Is the API running (npm run dev in server/)?', 0)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(data?.error ?? `Request failed (${response.status})`, response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
