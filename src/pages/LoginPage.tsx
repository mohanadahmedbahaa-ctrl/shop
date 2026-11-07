import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import TextField from '../components/ui/TextField'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setSubmitting(false)
    }
  }

  return (
    <Container className="max-w-md py-16">
      <title>Log in · Oakline</title>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-stone-600">Log in to your Oakline account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        New to Oakline?{' '}
        <Link to="/signup" state={{ from }} className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>

      {import.meta.env.DEV && (
        <div className="mt-10 rounded-xl border border-dashed border-stone-300 p-4 text-xs text-stone-500">
          <p className="font-medium text-stone-700">Demo accounts (created by npm run db:setup)</p>
          <p className="mt-1">admin@oakline.test · moderator@oakline.test · seller@oakline.test · buyer@oakline.test</p>
          <p className="mt-1">Password: the DEMO_PASSWORD value in server/.env</p>
        </div>
      )}
    </Container>
  )
}

export default LoginPage
