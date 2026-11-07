import type { OrderTotals, ShippingMethod } from '../utils/pricing'

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

export const orderStatusLabels: Record<OrderStatus, string> = {
  placed: 'Placed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export type OrderItem = {
  productId: number | null
  title: string
  image: string | null
  unitPrice: number
  quantity: number
}

export type Order = {
  id: number
  orderNumber: string
  userId: number | null
  customerName: string | null
  email: string
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod
  items: OrderItem[]
  totals: OrderTotals
  status: OrderStatus
  placedAt: string
}
