// All money rules live in ONE file. The cart, the drawer, checkout and the
// confirmation page all import from here, so a rule can never differ between pages.
import type { Product } from '../data/products'

export const FREE_SHIPPING_THRESHOLD = 75
export const TAX_RATE = 0.08

export type ShippingMethod = 'standard' | 'express'

export const shippingOptions: Record<ShippingMethod, { label: string; eta: string; price: number }> = {
  standard: { label: 'Standard', eta: '3–5 business days', price: 5.99 },
  express: { label: 'Express', eta: '1–2 business days', price: 14.99 },
}

// Computers store decimals in binary, so 0.1 + 0.2 = 0.30000000000000004.
// Rounding to cents avoids totals like $59.980000001.
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100
}

export function getShippingCost(subtotal: number, method: ShippingMethod): number {
  if (subtotal === 0) return 0
  if (method === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return shippingOptions[method].price
}

export type OrderTotals = {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

// A PURE FUNCTION: same input gives the same output, with no side effects.
// Pure functions are the easiest code to test and to explain in an interview.
// `method = 'standard'` is a DEFAULT PARAMETER.
export function getOrderTotals(subtotal: number, method: ShippingMethod = 'standard'): OrderTotals {
  const shipping = getShippingCost(subtotal, method)
  const tax = roundToCents(subtotal * TAX_RATE)
  return {
    subtotal: roundToCents(subtotal),
    shipping,
    tax,
    total: roundToCents(subtotal + shipping + tax),
  }
}

// Returns e.g. 20 for "20% off", or null when the product isn't on sale.
export function getDiscountPercent(product: Product): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null
  return Math.round((1 - product.price / product.compareAtPrice) * 100)
}
