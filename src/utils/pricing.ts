import type { Product } from '../data/products'

export const FREE_SHIPPING_THRESHOLD = 75
export const TAX_RATE = 0.08

export type ShippingMethod = 'standard' | 'express'

export const shippingOptions: Record<ShippingMethod, { label: string; eta: string; price: number }> = {
  standard: { label: 'Standard', eta: '3–5 business days', price: 5.99 },
  express: { label: 'Express', eta: '1–2 business days', price: 14.99 },
}

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

export function getDiscountPercent(product: Product): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null
  return Math.round((1 - product.price / product.compareAtPrice) * 100)
}
