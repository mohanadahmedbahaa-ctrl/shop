import { LoaderCircle, Lock } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { apiFetch } from '../api/client'
import OrderSummary from '../components/cart/OrderSummary'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import TextField from '../components/ui/TextField'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import type { Order, ShippingAddress } from '../types/order'
import { cn } from '../utils/cn'
import { formatPrice } from '../utils/formatPrice'
import { getOrderTotals, getShippingCost, shippingOptions, type ShippingMethod } from '../utils/pricing'

type CheckoutForm = { email: string } & ShippingAddress

type FormErrors = Partial<Record<keyof CheckoutForm, string>>

const initialForm: CheckoutForm = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  postalCode: '',
  country: 'United States',
}

const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Egypt', 'United Arab Emirates', 'Saudi Arabia']

function validate(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {}
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address'
  if (!form.firstName.trim()) errors.firstName = 'Enter your first name'
  if (!form.lastName.trim()) errors.lastName = 'Enter your last name'
  if (!form.address.trim()) errors.address = 'Enter your street address'
  if (!form.city.trim()) errors.city = 'Enter your city'
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(form.postalCode.trim())) errors.postalCode = 'Enter a valid postal code'
  return errors
}

function CheckoutPage() {
  const { items, subtotal, clearCart, status: cartStatus } = useCart()
  const { refresh: refreshProducts } = useProducts()
  const { user } = useAuth()
  const [form, setForm] = useState<CheckoutForm>(() => ({ ...initialForm, email: user?.email ?? '' }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  if (placedOrder) {
    return <Navigate to="/order-confirmation" state={{ order: placedOrder }} replace />
  }
  if (cartStatus === 'loading') {
    return (
      <div role="status" className="flex justify-center py-32 text-stone-500">
        <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading your cart</span>
      </div>
    )
  }
  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const totals = getOrderTotals(subtotal, shippingMethod)

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    setServerError(null)

    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementsByName(firstInvalid)[0]?.focus()
      return
    }

    const { email, ...shippingAddress } = form

    setSubmitting(true)
    try {
      const order = await apiFetch<Order>('/api/orders', {
        method: 'POST',
        body: {
          email,
          shippingAddress,
          shippingMethod,
          items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        },
      })
      setPlacedOrder(order)
      clearCart()
      refreshProducts()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not place the order')
      setSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Container className="pt-8">
      <title>Checkout · Oakline</title>
      <Breadcrumbs items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <form id="checkout-form" noValidate onSubmit={handleSubmit} className="space-y-10 lg:col-span-7">
          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </p>
          )}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-lg font-semibold">
              Contact information
            </h2>
            <TextField
              className="mt-4"
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
          </section>

          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="text-lg font-semibold">
              Shipping address
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField label="First name" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} error={errors.firstName} />
              <TextField label="Last name" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} error={errors.lastName} />
              <TextField className="sm:col-span-2" label="Address" name="address" autoComplete="address-line1" value={form.address} onChange={handleChange} error={errors.address} />
              <TextField className="sm:col-span-2" label="Apartment, suite, etc. (optional)" name="apartment" autoComplete="address-line2" value={form.apartment} onChange={handleChange} />
              <TextField label="City" name="city" autoComplete="address-level2" value={form.city} onChange={handleChange} error={errors.city} />
              <TextField label="Postal code" name="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={handleChange} error={errors.postalCode} />
              <div className="sm:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-stone-700">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  value={form.country}
                  onChange={handleChange}
                  className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  {countries.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <fieldset>
            <legend className="text-lg font-semibold">Delivery method</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(Object.entries(shippingOptions) as [ShippingMethod, (typeof shippingOptions)[ShippingMethod]][]).map(
                ([method, option]) => {
                  const cost = getShippingCost(subtotal, method)
                  return (
                    <label
                      key={method}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border border-stone-300 p-4 transition',
                        'has-checked:border-stone-900 has-checked:ring-1 has-checked:ring-stone-900',
                      )}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method}
                        checked={shippingMethod === method}
                        onChange={() => setShippingMethod(method)}
                        className="mt-0.5 size-4 accent-stone-900"
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{option.label}</span>
                        <span className="block text-sm text-stone-500">{option.eta}</span>
                      </span>
                      <span className="text-sm font-medium">{cost === 0 ? 'Free' : formatPrice(cost)}</span>
                    </label>
                  )
                },
              )}
            </div>
          </fieldset>

          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="text-lg font-semibold">
              Payment
            </h2>
            <div className="mt-4 flex gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                <strong className="font-medium text-stone-900">This is a demo store.</strong> No payment details are
                collected and nothing is charged. Your order is saved to your account and the stock is updated.
              </p>
            </div>
          </section>
        </form>

        <aside className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
          <OrderSummary totals={totals} shippingNote={shippingOptions[shippingMethod].label.toLowerCase()}>
            <ul className="mb-6 max-h-72 space-y-4 overflow-y-auto border-b border-stone-200 pb-6 pt-2">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 rounded-lg bg-white">
                    <img src={product.images[0]} alt="" className="size-full object-contain p-1.5" />
                    <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-stone-700 text-[10px] font-semibold text-white">
                      {quantity}
                    </span>
                  </div>
                  <p className="flex-1 text-sm font-medium">{product.title}</p>
                  <p className="text-sm tabular-nums">{formatPrice(product.price * quantity)}</p>
                </li>
              ))}
            </ul>
            <Button type="submit" form="checkout-form" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Placing order…' : `Place order · ${formatPrice(totals.total)}`}
            </Button>
          </OrderSummary>
        </aside>
      </div>
    </Container>
  )
}

export default CheckoutPage
