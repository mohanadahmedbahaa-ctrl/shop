import { CircleCheck } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router'
import OrderSummary from '../components/cart/OrderSummary'
import { buttonStyles } from '../components/ui/buttonStyles'
import Container from '../components/ui/Container'
import type { Order } from '../types/order'
import { formatPrice } from '../utils/formatPrice'
import { shippingOptions } from '../utils/pricing'

function OrderConfirmationPage() {
  // 1. Read the order that CheckoutPage passed with navigate(..., { state: { order } }).
  //    `location.state` is typed `unknown`-ish, so we tell TypeScript what we expect,
  //    and handle the case where someone opens this URL directly (no order: go home).
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order

  if (!order) {
    return <Navigate to="/" replace />
  }

  const { shippingAddress: address } = order
  // 2. Intl.DateTimeFormat formats dates for humans: "November 7, 2026"
  const placedOn = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(order.placedAt))

  return (
    <Container className="max-w-3xl pt-16">
      <title>Order confirmed · Oakline</title>

      <div className="text-center">
        <CircleCheck className="mx-auto size-14 text-emerald-600" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Thank you, {address.firstName}!</h1>
        <p className="mt-3 text-stone-600">
          Order <strong className="font-semibold text-stone-900">#{order.id}</strong> was placed on {placedOn}.
        </p>
        <p className="mt-1 text-sm text-stone-500">
          A confirmation would be sent to {order.email} (this is a demo, so no email is sent).
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold">Shipping to</h2>
          {/* <address> is the semantic HTML element for contact/postal info */}
          <address className="mt-3 text-sm not-italic leading-relaxed text-stone-600">
            {address.firstName} {address.lastName}
            <br />
            {address.address}
            {address.apartment && `, ${address.apartment}`}
            <br />
            {address.postalCode} {address.city}
            <br />
            {address.country}
          </address>
        </div>
        <div className="rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold">Delivery</h2>
          <p className="mt-3 text-sm text-stone-600">
            {shippingOptions[order.shippingMethod].label} shipping
            <br />
            Arrives in {shippingOptions[order.shippingMethod].eta}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <OrderSummary totals={order.totals} title="Order details">
          <ul className="space-y-4 border-t border-stone-200 pt-6">
            {order.items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-4">
                <img src={product.images[0]} alt="" className="size-14 rounded-lg bg-white object-contain p-1" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{product.title}</p>
                  <p className="text-stone-500">Qty {quantity}</p>
                </div>
                <p className="text-sm tabular-nums">{formatPrice(product.price * quantity)}</p>
              </li>
            ))}
          </ul>
        </OrderSummary>
      </div>

      <div className="mt-10 text-center">
        <Link to="/shop" className={buttonStyles('primary', 'lg')}>
          Continue shopping
        </Link>
      </div>
    </Container>
  )
}

export default OrderConfirmationPage
