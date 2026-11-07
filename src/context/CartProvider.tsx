import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { products, type Product } from '../data/products'
import { CartContext, type CartItem, type CartLine } from './CartContext'

const STORAGE_KEY = 'oakline-cart'

// 1. A Map gives fast lookup by id: productsById.get(3) instead of searching the array each time.
const productsById = new Map(products.map((p) => [p.id, p]))

// 2. Load the saved cart. localStorage data is UNTRUSTED (old format, edited by hand...),
//    so we validate each line and drop anything that isn't a real product.
function loadCart(): CartLine[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter(
      (line): line is CartLine =>
        typeof line?.productId === 'number' &&
        typeof line?.quantity === 'number' &&
        line.quantity > 0 &&
        productsById.has(line.productId),
    )
  } catch {
    return []
  }
}

type Props = {
  children: ReactNode
}

export function CartProvider({ children }: Props) {
  // 3. Lazy initial state: React calls loadCart only once, on the first render.
  const [lines, setLines] = useState<CartLine[]>(loadCart)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // 4. Save the cart whenever `lines` changes (useEffect runs after render).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Storage blocked or full: the cart still works for this visit.
    }
  }, [lines])

  // 5. IMMUTABLE updates: always return a NEW array, never push or mutate.
  //    The updater form setLines(prev => ...) always uses the latest state.
  //    Math.min(..., product.stock) means you can't add more than is in stock.
  function addToCart(product: Product, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id)
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock) }
            : line,
        )
      }
      return [...prev, { productId: product.id, quantity: Math.min(quantity, product.stock) }]
    })
    // Good e-commerce UX: show the user what happened by opening the cart drawer.
    setIsCartOpen(true)
  }

  function removeFromCart(productId: number) {
    setLines((prev) => prev.filter((line) => line.productId !== productId))
  }

  function updateQuantity(productId: number, quantity: number) {
    const stock = productsById.get(productId)?.stock ?? 0
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    setLines((prev) =>
      prev.map((line) =>
        line.productId === productId ? { ...line, quantity: Math.min(quantity, stock) } : line,
      ),
    )
  }

  function clearCart() {
    setLines([])
  }

  // 6. useCallback keeps the SAME function between renders.
  //    The drawer uses closeCart inside a useEffect dependency list. Without useCallback,
  //    a new function every render would re-run that effect on every cart change.
  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  // 7. DERIVED data, calculated on each render. Not stored in state, so it can't get out of sync.
  //    flatMap: return [item] to keep a line, or [] to drop it (a product that no longer exists).
  const items: CartItem[] = lines.flatMap((line) => {
    const product = productsById.get(line.productId)
    return product ? [{ product, quantity: line.quantity }] : []
  })
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
