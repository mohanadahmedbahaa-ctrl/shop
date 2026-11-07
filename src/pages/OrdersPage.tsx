import { ChevronDown, LoaderCircle, Package } from 'lucide-react'
import { Link } from 'react-router'
import OrderSummary from '../components/cart/OrderSummary'
import OrderItemList from '../components/orders/OrderItemList'
import OrderStatusBadge from '../components/orders/OrderStatusBadge'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import Container from '../components/ui/Container'
import { useApiData } from '../hooks/useApiData'
import type { Order } from '../types/order'
import { formatPrice } from '../utils/formatPrice'
import { shippingOptions } from '../utils/pricing'

const formatDate = (iso: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso))

function OrdersPage() {
  const { data: orders, status, error, reload } = useApiData<Order[]>('/api/orders/mine')

  return (
    <Container className="max-w-3xl py-10">
      <title>My orders · Oakline</title>
      <Breadcrumbs items={[{ label: 'My account', to: '/account' }, { label: 'My orders' }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">My orders</h1>

      {status === 'loading' && (
        <div role="status" className="flex justify-center py-20 text-stone-500">
          <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading your orders</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-8 rounded-2xl bg-red-50 p-6 text-sm text-red-700">
          <p>{error}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      {status === 'ready' && orders?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-3xl bg-stone-50 px-6 py-16 text-center">
          <Package className="size-10 text-stone-400" aria-hidden="true" />
          <p className="mt-4 font-medium">You haven't placed any orders yet</p>
          <Link to="/shop" className={buttonStyles('primary', 'md', 'mt-6')}>
            Start shopping
          </Link>
        </div>
      )}

      {status === 'ready' && orders && orders.length > 0 && (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <details className="group rounded-2xl border border-stone-200">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-5 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-32">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-stone-500">{formatDate(order.placedAt)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm text-stone-600">
                    {order.items.reduce((n, item) => n + item.quantity, 0)} items
                  </p>
                  <p className="ml-auto font-semibold tabular-nums">{formatPrice(order.totals.total)}</p>
                  <ChevronDown className="size-5 text-stone-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>

                <div className="grid gap-6 border-t border-stone-200 p-5 sm:grid-cols-2">
                  <div>
                    <OrderItemList items={order.items} />
                    <p className="mt-6 text-sm text-stone-600">
                      <span className="font-medium text-stone-900">Shipping to:</span> {order.shippingAddress.firstName}{' '}
                      {order.shippingAddress.lastName}, {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.country}
                    </p>
                  </div>
                  <OrderSummary
                    totals={order.totals}
                    title="Payment summary"
                    shippingNote={shippingOptions[order.shippingMethod].label.toLowerCase()}
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}

export default OrdersPage
