import { ShoppingBag, Store } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import TextField from '../components/ui/TextField'
import { useAuth, type SignupData } from '../context/AuthContext'
import { cn } from '../utils/cn'

type FormErrors = Partial<Record<keyof SignupData, string>>

const accountTypes = [
  { value: 'buyer', title: 'Buyer', text: 'Shop and place orders', icon: ShoppingBag },
  { value: 'seller', title: 'Seller', text: 'Sell your own products in this store', icon: Store },
] as const

function validate(form: SignupData): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = 'Enter your name'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address'
  if (form.password.length < 8) errors.password = 'Use at least 8 characters'
  return errors
}

function SignupPage() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [form, setForm] = useState<SignupData>({ name: '', email: '', password: '', accountType: 'buyer' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) {
    return <Navigate to="/account" replace />
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      const created = await signup(form)
      navigate(created.role === 'seller' ? '/dashboard/products/new' : (from ?? '/account'), { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign up failed')
      setSubmitting(false)
    }
  }

  return (
    <Container className="max-w-md py-16">
      <title>Create account · E-commerce</title>
      <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-stone-600">Shop faster, or start selling your own products.</p>

      <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <fieldset>
          <legend className="text-sm font-medium text-stone-700">I want to</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {accountTypes.map(({ value, title, text, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer flex-col gap-2 rounded-xl border border-stone-300 p-4 transition',
                  'has-checked:border-stone-900 has-checked:ring-1 has-checked:ring-stone-900',
                  'has-focus-visible:outline-2 has-focus-visible:outline-brand-600',
                )}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={value}
                  checked={form.accountType === value}
                  onChange={() => setForm((prev) => ({ ...prev, accountType: value }))}
                  className="sr-only"
                />
                <Icon className="size-5 text-stone-700" aria-hidden="true" />
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-xs text-stone-500">{text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <TextField label="Full name" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} />
        <TextField label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <p className="-mt-3 text-xs text-stone-500">At least 8 characters.</p>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Already have an account?{' '}
        <Link to="/login" state={{ from }} className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </Container>
  )
}

export default SignupPage
