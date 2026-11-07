import { LoaderCircle, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useAuth, type Role } from '../../context/AuthContext'
import { buttonStyles } from '../ui/buttonStyles'
import Container from '../ui/Container'

type Props = {
  children: ReactNode
  roles?: Role[] // leave out = any logged-in user
}

// A ROUTE GUARD: wrap a page to protect it.
//   <RequireAuth roles={['admin']}><UsersPage /></RequireAuth>
// It only hides pages in the UI. The API checks permissions again on every request,
// because anyone can call the API directly without using this React app.
function RequireAuth({ children, roles }: Props) {
  const { user, status } = useAuth()
  const location = useLocation()

  // 1. Still checking a saved token: wait. Redirecting now would send a logged-in user to /login.
  if (status === 'checking') {
    return (
      <div role="status" className="flex justify-center py-32 text-stone-500">
        <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Checking your session</span>
      </div>
    )
  }

  // 2. Not logged in: go to /login, and remember where they wanted to go (`from`).
  //    The login page sends them back there afterwards.
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // 3. Logged in but the wrong role: explain instead of a silent redirect.
  if (roles && !roles.includes(user.role)) {
    return (
      <Container className="flex flex-col items-center py-24 text-center">
        <ShieldAlert className="size-10 text-stone-400" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold">You don't have access to this page</h1>
        <p className="mt-2 max-w-md text-stone-600">This page is for {roles.join(' and ')} accounts only.</p>
        <Link to="/account" className={buttonStyles('primary', 'md', 'mt-8')}>
          Go to my account
        </Link>
      </Container>
    )
  }

  return children
}

export default RequireAuth
