import { useState, type ChangeEvent } from 'react'
import { apiFetch } from '../../api/client'
import { useProducts } from '../../context/ProductsContext'
import { orderStatusLabels, type Order, type OrderStatus } from '../../types/order'
import { formatPrice } from '../../utils/formatPrice'
import OrderStatusBadge from './OrderStatusBadge'

const statuses = Object.keys(orderStatusLabels) as OrderStatus[]

type Props = {
  orders: Order[]
  onOrderUpdated: (order: Order) => void
}

function AdminOrdersTable({ orders, onOrderUpdated }: Props) {
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { refresh: refreshProducts } = useProducts()

  async function changeStatus(order: Order, event: ChangeEvent<HTMLSelectElement>) {
    const status = event.target.value as OrderStatus
    if (status === 'cancelled' && !window.confirm(`Cancel ${order.orderNumber}? The items go back in stock. This can't be undone.`)) {
      return
    }
    setError(null)
    setSavingId(order.id)
    try {
      onOrderUpdated(await apiFetch<Order>(`/api/orders/${order.id}/status`, { method: 'PATCH', body: { status } }))
      if (status === 'cancelled') refreshProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the order')
    } finally {
      setSavingId(null)
    }
  }

  if (orders.length === 0) {
    return <p className="rounded-2xl bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">No orders yet.</p>
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-stone-200">
        <table className="w-full min-w-3xl text-left text-sm">
          <caption className="sr-only">Orders</caption>
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Order</th>
              <th scope="col" className="px-4 py-3 font-medium">Customer</th>
              <th scope="col" className="px-4 py-3 font-medium">Items</th>
              <th scope="col" className="px-4 py-3 font-medium">Total</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-stone-500">{new Date(order.placedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{order.customerName ?? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}</p>
                  <p className="text-xs text-stone-500">{order.email}</p>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  <span title={order.items.map((i) => `${i.quantity}× ${i.title}`).join('\n')}>
                    {order.items.reduce((n, i) => n + i.quantity, 0)} items
                  </span>
                </td>
                <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(order.totals.total)}</td>
                <td className="px-4 py-3">
                  {order.status === 'cancelled' ? (
                    <OrderStatusBadge status="cancelled" />
                  ) : (
                    <select
                      value={order.status}
                      onChange={(e) => changeStatus(order, e)}
                      disabled={savingId === order.id}
                      aria-label={`Status of ${order.orderNumber}`}
                      className="h-9 rounded-full border border-stone-300 bg-white pl-3 pr-8 text-sm outline-none focus:border-stone-500 disabled:opacity-50"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {orderStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminOrdersTable
