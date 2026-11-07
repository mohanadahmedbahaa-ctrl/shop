import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ApiError, apiFetch, getToken, setToken } from '../api/client'
import { AuthContext, type SignupData, type User } from './AuthContext'

type AuthResponse = { token: string; user: User }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<'checking' | 'ready'>(() => (getToken() ? 'checking' : 'ready'))

  useEffect(() => {
    if (!getToken()) return
    let ignore = false

    apiFetch<User>('/api/auth/me')
      .then((me) => {
        if (!ignore) setUser(me)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) setToken(null)
      })
      .finally(() => {
        if (!ignore) setStatus('ready')
      })

    return () => {
      ignore = true
    }
  }, [])

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

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, status, login, signup, logout }}>{children}</AuthContext.Provider>
}
