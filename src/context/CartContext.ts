// WHY CONTEXT?
// The cart is needed in many places: header badge, cart drawer, product cards,
// product page, cart page and checkout. Context shares it without "prop drilling".
//
// This file = the context object + types + the useCart() hook.
// CartProvider.tsx = the component that actually holds the state.
// (Split because the React Refresh lint rule wants component files to export only components.)
import { createContext, useContext } from 'react'
import type { Product } from '../data/products'

// 1. What we STORE (and save to localStorage): only ids and quantities.
//    Storing whole product objects would mean stale prices if the catalog changes.
//    Rule: store the MINIMUM state, and derive the rest.
export type CartLine = {
  productId: number
  quantity: number
}

// 2. What components RECEIVE: lines joined with the full product data.
export type CartItem = {
  product: Product
  quantity: number
}

export type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  // 'loading' while a logged-in user's cart is fetched from the server.
  status: 'loading' | 'ready'
  // `quantity?: number` is an optional parameter (defaults to 1 in the provider)
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  // UI state for the slide-out cart drawer, shared because the header opens it
  // and "Add to cart" buttons open it too.
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

// A CUSTOM HOOK: hook names start with "use". It throws a clear error if you forget the provider.
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (context === null) {
    throw new Error('useCart() must be used inside <CartProvider>')
  }
  return context
}
