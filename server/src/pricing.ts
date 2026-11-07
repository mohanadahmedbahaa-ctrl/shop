// THE SERVER'S COPY OF THE MONEY RULES. Same numbers as src/utils/pricing.ts in React.
//
// Why calculate on the server at all, if the frontend already shows the totals?
// Because the browser is under the USER's control. Anyone can open DevTools or use curl and send
// { "total": 0.01 }. So the API ignores any prices the client sends: it reads the real prices
// from the database and computes everything itself. The frontend's numbers are only a preview.

export const SHIPPING_METHODS = ['standard', 'express'] as const
export type ShippingMethod = (typeof SHIPPING_METHODS)[number]

// 1. Everything in CENTS (whole numbers). Integers have no rounding errors:
//    in dollars, 0.1 + 0.2 = 0.30000000000000004; in cents, 10 + 20 = 30. Always.
const FREE_SHIPPING_THRESHOLD_CENTS = 7500 // $75
const TAX_RATE = 0.08
const SHIPPING_CENTS: Record<ShippingMethod, number> = { standard: 599, express: 1499 }

// "19.99" or 19.99 -> 1999. Math.round fixes values like 19.99 * 100 = 1998.9999999999998
export const toCents = (dollars: number | string) => Math.round(Number(dollars) * 100)
export const toDollars = (cents: number) => cents / 100

export type Totals = { subtotal: number; shipping: number; tax: number; total: number }

// 2. The same rules as the frontend's getOrderTotals(), but in cents. Returns cents.
export function computeTotalsCents(subtotalCents: number, method: ShippingMethod): Totals {
  const shipping =
    subtotalCents === 0 || (method === 'standard' && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) ? 0 : SHIPPING_CENTS[method]
  const tax = Math.round(subtotalCents * TAX_RATE)
  return { subtotal: subtotalCents, shipping, tax, total: subtotalCents + shipping + tax }
}
