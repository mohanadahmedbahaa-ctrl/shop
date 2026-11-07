import { CircleCheck } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router'
import OrderSummary from '../components/cart/OrderSummary'
import OrderItemList from '../components/orders/OrderItemList'
import { buttonStyles } from '../components/ui/buttonStyles'
import Container from '../components/ui/Container'
import type { Order } from '../types/order'
import { shippingOptions } from '../utils/pricing'

function OrderConfirmationPage() {
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order

  if (!order) {
    return <Navigate to="/" replace />
  }

  const { shippingAddress: address } = order
  const placedOn = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(order.placedAt))

  return (
    <Container className="max-w-3xl pt-16">
      <title>Order confirmed · Oakline</title>

      <div className="text-center">
        <CircleCheck className="mx-auto size-14 text-emerald-600" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Thank you, {address.firstName}!</h1>
        <p className="mt-3 text-stone-600">
          Order <strong className="font-semibold text-stone-900">{order.orderNumber}</strong> was placed on {placedOn}.
        </p>
        <p className="mt-1 text-sm text-stone-500">
          A confirmation would be sent to {order.email} (this is a demo, so no email is sent).
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold">Shipping to</h2>
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
          <div className="border-t border-stone-200 pt-6">
            <OrderItemList items={order.items} />
          </div>
        </OrderSummary>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/shop" className={buttonStyles('primary', 'lg')}>
          Continue shopping
        </Link>
        <Link to="/account/orders" className={buttonStyles('secondary', 'lg')}>
          View my orders
        </Link>
      </div>
    </Container>
  )
}

export default OrderConfirmationPage
