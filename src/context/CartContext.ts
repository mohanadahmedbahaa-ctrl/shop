import { createContext, useContext } from 'react'
import type { Product } from '../data/products'

export type CartLine = {
  productId: number
  quantity: number
}

export type CartItem = {
  product: Product
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  status: 'loading' | 'ready'
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (context === null) {
    throw new Error('useCart() must be used inside <CartProvider>')
  }
  return context
}
