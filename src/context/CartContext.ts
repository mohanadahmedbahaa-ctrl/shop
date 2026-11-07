// WHY CONTEXT?
// The cart is needed in MANY places: the Navbar (count badge), ProductCard (add button),
// the details page and the cart page. Passing it down through props at every level
// ("prop drilling") gets messy. Context lets any component read shared data directly.
//
// This file holds the context object, its TYPES and the useCart() hook.
// The component that actually stores the state is in CartProvider.tsx.
// (They're split because the React Refresh lint rule wants component files
//  to export only components.)
import { createContext, useContext } from 'react'
import type { Product } from '../data/products'

// 1. One line in the cart = a product + how many of it.
export type CartItem = {
  product: Product
  quantity: number
}

// 2. Everything the context gives to components: data AND functions to change it.
//    `(product: Product) => void` is a FUNCTION TYPE: it takes a Product and returns nothing.
export type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

// 3. Create the context. The default is `null`, which means "no provider found".
//    `<CartContextValue | null>` is a GENERIC: it tells TypeScript what the context holds.
export const CartContext = createContext<CartContextValue | null>(null)

// 4. A CUSTOM HOOK. Hooks are functions whose names start with "use".
//    Components call useCart() instead of useContext(CartContext) directly.
//    Bonus: if someone forgets the <CartProvider>, they get a clear error message.
export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (context === null) {
    throw new Error('useCart() must be used inside <CartProvider>')
  }
  return context
}
