// Who is logged in? Shared with the header, the protected pages and checkout.
import { createContext, useContext } from 'react'

// 1. Same roles as the backend (server/src/types.ts) and the database CHECK constraint.
export type Role = 'buyer' | 'seller' | 'moderator' | 'admin'

export type User = {
  id: number
  name: string
  email: string
  role: Role
  createdAt: string
}

export type SignupData = {
  name: string
  email: string
  password: string
  accountType: 'buyer' | 'seller'
}

export type AuthContextValue = {
  user: User | null
  // 'checking' while we ask the API whether a saved token is still valid.
  // Protected pages wait for this, so a logged-in user isn't bounced to /login on refresh.
  status: 'checking' | 'ready'
  login: (email: string, password: string) => Promise<User>
  signup: (data: SignupData) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth() must be used inside <AuthProvider>')
  }
  return context
}

// 2. PERMISSIONS in one place, mirroring the backend rules.
//    The UI uses these to SHOW or HIDE buttons. That's only for convenience:
//    the real protection is on the server, which checks every request again.
export const canManageProducts = (user: User | null) =>
  user?.role === 'seller' || user?.role === 'moderator' || user?.role === 'admin'

export const canModerate = (user: User | null) => user?.role === 'moderator' || user?.role === 'admin'

export const isAdmin = (user: User | null) => user?.role === 'admin'

export const roleLabels: Record<Role, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  moderator: 'Moderator',
  admin: 'Admin',
}
