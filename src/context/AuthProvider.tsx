import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ApiError, apiFetch, getToken, setToken } from '../api/client'
import { AuthContext, type SignupData, type User } from './AuthContext'

type AuthResponse = { token: string; user: User }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // 1. If there's no saved token there's nothing to check, so we're "ready" immediately.
  //    Lazy initial state: getToken() runs only on the first render.
  const [status, setStatus] = useState<'checking' | 'ready'>(() => (getToken() ? 'checking' : 'ready'))

  // 2. On app start: a token in localStorage might be expired, or the user might have been
  //    deleted or had their role changed. GET /api/auth/me asks the server who we really are.
  useEffect(() => {
    if (!getToken()) return
    let ignore = false

    apiFetch<User>('/api/auth/me')
      .then((me) => {
        if (!ignore) setUser(me)
      })
      .catch((err) => {
        // 401 = the token is no longer valid: forget it. Other errors (server down) keep it,
        // so a temporary outage doesn't log everyone out.
        if (err instanceof ApiError && err.status === 401) setToken(null)
      })
      .finally(() => {
        if (!ignore) setStatus('ready')
      })

    return () => {
      ignore = true
    }
  }, [])

  // 3. login and signup both get { token, user } back: save the token, remember the user.
  //    They RETURN the user so the page can redirect based on the role.
  //    Errors (wrong password, email taken) are thrown on to the form, which shows the message.
  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (input: SignupData) => {
    const data = await apiFetch<AuthResponse>('/api/auth/signup', { method: 'POST', body: input })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  // 4. With JWTs, "logging out" just means the browser forgets the token.
  //    (The token itself stays valid until it expires; real apps add a short expiry
  //    or a server-side block list if that matters.)
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, status, login, signup, logout }}>{children}</AuthContext.Provider>
}
