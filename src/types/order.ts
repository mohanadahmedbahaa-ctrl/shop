import type { CartItem } from '../context/CartContext'
import type { OrderTotals, ShippingMethod } from '../utils/pricing'

// What checkout creates and the confirmation page shows.
// In Phase 2 this object is what you'll POST to your API.
export type ShippingAddress = {
  firstName: string
  lastName: string
  address: string
  apartment: string
  city: string
  postalCode: string
  country: string
}

export type Order = {
  id: string
  email: string
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod
  items: CartItem[]
  totals: OrderTotals
  placedAt: string // ISO date string, e.g. "2026-11-07T10:30:00.000Z"
}
