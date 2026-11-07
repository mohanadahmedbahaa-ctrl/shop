import { createContext, useContext } from 'react'

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

type AuthContextValue = {
  user: User | null
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
