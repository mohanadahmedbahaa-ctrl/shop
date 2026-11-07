import type { OrderTotals, ShippingMethod } from '../utils/pricing'

// The order as the API sends it (server/src/types.ts has the same shape).
// Phase 1 built this object in the browser; now the SERVER creates it, with prices it looked up itself.
export type ShippingAddress = {
  firstName: string
  lastName: string
  address: string
  apartment: string
  city: string
  postalCode: string
  country: string
}

export type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled'

// The life cycle, in order. Labels for the badge and the admin's status <select>.
export const orderStatusLabels: Record<OrderStatus, string> = {
  placed: 'Placed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// A SNAPSHOT of a product at checkout: title and price as they were when the order was paid.
// productId is null if the product has been deleted since; the receipt still works.
export type OrderItem = {
  productId: number | null
  title: string
  image: string | null
  unitPrice: number
  quantity: number
}

export type Order = {
  id: number
  orderNumber: string // "OAK-1001"
  userId: number | null
  customerName: string | null
  email: string
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod
  items: OrderItem[]
  totals: OrderTotals
  status: OrderStatus
  placedAt: string // ISO date string, e.g. "2026-11-07T10:30:00.000Z"
}
