// ONE place that talks to the backend. Every request goes through apiFetch(), so the
// base URL, the JSON headers, the login token and the error handling are written once.

// 1. Vite exposes env variables that start with VITE_ on import.meta.env.
//    Locally the API runs on port 3001; when you deploy, set VITE_API_URL to the real address.
const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// 2. A custom Error class that also carries the HTTP status (401, 403, 404...),
//    so components can react differently, e.g. "401 -> go to login".
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// 3. The login token is saved in localStorage so you stay logged in after a refresh.
//    (Trade-off to know for interviews: localStorage can be read by any script on the page,
//    so an XSS bug could steal it. httpOnly cookies avoid that but need more server setup.)
const TOKEN_KEY = 'oakline-token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage blocked: you stay logged in until the page is closed
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

// 4. A GENERIC function: apiFetch<Product[]>('/api/products') returns Promise<Product[]>.
//    The caller says what type it expects; TypeScript then checks how the result is used.
//    (TypeScript can't verify what the server REALLY sends; the backend types keep both sides in sync.)
export async function apiFetch<T>(path: string, { method = 'GET', body }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  // Attach the token if we have one: "Authorization: Bearer <token>"
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
    // fetch only throws when there is NO response at all: server down, no internet, CORS blocked.
    throw new ApiError('Could not reach the server. Is the API running (npm run dev in server/)?', 0)
  }

  // 5. fetch does NOT throw on 400/500 responses. We must check response.ok ourselves.
  //    Our API always sends { error: "..." } on failure, so we show that message.
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(data?.error ?? `Request failed (${response.status})`, response.status)
  }

  // 204 No Content (e.g. after DELETE) has no body to parse.
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
