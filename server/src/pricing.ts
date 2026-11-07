export const SHIPPING_METHODS = ['standard', 'express'] as const
export type ShippingMethod = (typeof SHIPPING_METHODS)[number]

const FREE_SHIPPING_THRESHOLD_CENTS = 7500
const TAX_RATE = 0.08
const SHIPPING_CENTS: Record<ShippingMethod, number> = { standard: 599, express: 1499 }

export const toCents = (dollars: number | string) => Math.round(Number(dollars) * 100)
export const toDollars = (cents: number) => cents / 100

type Totals = { subtotal: number; shipping: number; tax: number; total: number }

export function computeTotalsCents(subtotalCents: number, method: ShippingMethod): Totals {
  const shipping =
    subtotalCents === 0 || (method === 'standard' && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) ? 0 : SHIPPING_CENTS[method]
  const tax = Math.round(subtotalCents * TAX_RATE)
  return { subtotal: subtotalCents, shipping, tax, total: subtotalCents + shipping + tax }
}
