import { Lock } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import OrderSummary from '../components/cart/OrderSummary'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import TextField from '../components/ui/TextField'
import { useCart } from '../context/CartContext'
import type { Order, ShippingAddress } from '../types/order'
import { cn } from '../utils/cn'
import { formatPrice } from '../utils/formatPrice'
import { getOrderTotals, getShippingCost, shippingOptions, type ShippingMethod } from '../utils/pricing'

// 1. The whole form in ONE state object. `&` combines the email with the address fields.
type CheckoutForm = { email: string } & ShippingAddress

// Partial<Record<K, string>> = "an object that MAY have a string message for each field".
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

// 2. VALIDATION as a pure function: form in, errors out. Easy to test and reuse.
//    (Always validate on the server too in Phase 2. Users can bypass frontend checks.)
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
  const { items, subtotal, clearCart } = useCart()
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  // Set once the order is placed. The redirect below then happens declaratively.
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  // 3. RULES OF HOOKS: every hook (useState, useCart...) must run on EVERY render, in the
  //    same order. That's why these early returns come AFTER all the hooks above, never before.
  //    <Navigate> redirects during render.
  //
  //    ORDER MATTERS: check `placedOrder` FIRST. Placing an order empties the cart, and if the
  //    empty-cart check ran first it would send the user to /cart instead of the confirmation.
  //    (A bug I hit while testing: calling navigate() and clearCart() in the same click
  //    handler let the empty-cart redirect win.)
  if (placedOrder) {
    return <Navigate to="/order-confirmation" state={{ order: placedOrder }} replace />
  }
  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const totals = getOrderTotals(subtotal, shippingMethod)

  // 4. ONE change handler for ALL fields, thanks to each input's `name` attribute.
  //    [name]: value is a "computed property name": { [name]: value } -> { city: 'Cairo' }.
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear that field's error as soon as the user starts fixing it.
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)

    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      // Move focus to the first broken field. Users (and screen readers) land right on the problem.
      document.getElementsByName(firstInvalid)[0]?.focus()
      return
    }

    // 5. Rest destructuring: take `email` out, put every other field into `shippingAddress`.
    const { email, ...shippingAddress } = form
    const order: Order = {
      id: `OAK-${Date.now().toString(36).toUpperCase()}`,
      email,
      shippingAddress,
      shippingMethod,
      items,
      totals,
      placedAt: new Date().toISOString(),
    }

    // 6. Both updates happen in the same re-render: the <Navigate> above then passes the
    //    order to the next page through navigation `state` (no URL params needed).
    //    In Phase 2 you'll POST `order` to your API here first, and use the server's response.
    setPlacedOrder(order)
    clearCart()
  }

  return (
    <Container className="pt-8">
      <title>Checkout · Oakline</title>
      <Breadcrumbs items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        {/* noValidate turns off the browser's popups so OUR messages show instead, styled consistently. */}
        <form id="checkout-form" noValidate onSubmit={handleSubmit} className="space-y-10 lg:col-span-7">
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-lg font-semibold">
              Contact information
            </h2>
            <TextField
              className="mt-4"
              label="Email address"
              name="email"
              type="email"
              autoComplete="email" // autoComplete lets the browser fill in saved details: much faster checkout
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
              {/* Object.entries turns { standard: {...}, express: {...} } into [key, value] pairs. */}
              {(Object.entries(shippingOptions) as [ShippingMethod, (typeof shippingOptions)[ShippingMethod]][]).map(
                ([method, option]) => {
                  const cost = getShippingCost(subtotal, method)
                  return (
                    // `has-checked:` (Tailwind v4) styles the card when the radio INSIDE it is checked.
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
                collected and nothing is charged. Placing an order just shows the confirmation page.
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
            {/* 7. The `form` attribute links this button to the <form id="checkout-form"> even
                though it sits OUTSIDE the form element in the HTML. */}
            <Button type="submit" form="checkout-form" size="lg" className="w-full">
              Place order · {formatPrice(totals.total)}
            </Button>
          </OrderSummary>
        </aside>
      </div>
    </Container>
  )
}

export default CheckoutPage
