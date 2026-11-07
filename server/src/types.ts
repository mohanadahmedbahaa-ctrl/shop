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
  sellerId: number | null
  sellerName: string | null
}

export type Category = {
  slug: string
  name: string
  tagline: string
}

export const ROLES = ['buyer', 'seller', 'moderator', 'admin'] as const
export type Role = (typeof ROLES)[number]

export type PublicUser = {
  id: number
  name: string
  email: string
  role: Role
  createdAt: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: PublicUser
    }
  }
}

export const ORDER_STATUSES = ['placed', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

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
