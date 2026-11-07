// The JSON shape the API sends. It matches the `Product` type in the React app
// (src/data/products.ts), so switching the frontend to the API changes almost nothing.
// Notice the camelCase names: the database uses snake_case (compare_at_price),
// JavaScript uses camelCase (compareAtPrice). The API translates between the two.
export type Product = {
  id: number
  title: string
  description: string
  category: string
  price: number
  compareAtPrice?: number
  rating: number
  reviewCount: number
  stock: number
  images: string[]
  sellerId: number | null // null = the store's own product
  sellerName: string | null
}

export type Category = {
  slug: string
  name: string
  tagline: string
}

// 1. The same 4 roles as the CHECK constraint in schema.sql.
//    `as const` + typeof [number] = a union type built from the array, so the list
//    exists once and is usable both as a value (for validation) and as a type.
export const ROLES = ['buyer', 'seller', 'moderator', 'admin'] as const
export type Role = (typeof ROLES)[number]

// 2. A user as the API SENDS it. There is deliberately NO passwordHash here:
//    the hash must never leave the server, not even to the user it belongs to.
export type PublicUser = {
  id: number
  name: string
  email: string
  role: Role
  createdAt: string
}

// 3. DECLARATION MERGING: we add a `user` property to Express's own Request type.
//    The requireAuth middleware (auth.ts) fills it in, and every route after it can
//    read req.user with full type checking.
declare global {
  // Express declares its types inside a namespace, so extending them needs one too.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: PublicUser
    }
  }
}

// 4. ORDERS as the API sends them (see routes/orders.ts).
export const ORDER_STATUSES = ['placed', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderItem = {
  productId: number | null // null if the product was deleted since
  title: string
  image: string | null
  unitPrice: number // the price PAID, not today's price
  quantity: number
}

export type Order = {
  id: number
  orderNumber: string // "OAK-1001"
  userId: number | null
  customerName: string | null
  email: string
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    apartment: string
    city: string
    postalCode: string
    country: string
  }
  shippingMethod: 'standard' | 'express'
  items: OrderItem[]
  totals: { subtotal: number; shipping: number; tax: number; total: number }
  status: OrderStatus
  placedAt: string
}
