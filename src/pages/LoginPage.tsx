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
  // 1. Where to go after logging in: the page RequireAuth sent us from, or the account page.
  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  // 2. `submitting` disables the button while waiting, so a double click can't send two requests.
  const [submitting, setSubmitting] = useState(false)

  // Already logged in (e.g. pressed Back after logging in): nothing to do here.
  if (user && !submitting) {
    return <Navigate to={from} replace />
  }

  // 3. An ASYNC event handler: `await` pauses until the API answers.
  //    try/catch: success -> navigate, failure -> show the server's message.
  //    `submitting` is reset ONLY on failure. On success the page is about to be left, and
  //    resetting it would let the "already logged in" redirect above race the navigation.
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
        {/* role="alert": screen readers read the error out loud as soon as it appears */}
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
        {/* autoComplete="current-password" lets password managers fill it in */}
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

      {/* import.meta.env.DEV is true only with `npm run dev`. This hint never ships to production. */}
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
