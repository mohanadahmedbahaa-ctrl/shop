import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '../api/client'
import type { Product } from '../data/products'
import { useAuth } from './AuthContext'
import { CartContext, type CartItem, type CartLine } from './CartContext'
import { useProducts } from './ProductsContext'
import { readStorage, writeStorage } from '../utils/storage'

const STORAGE_KEY = 'ecommerce-cart'

function loadGuestCart(): CartLine[] {
  try {
    const saved: unknown = JSON.parse(readStorage(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter(
      (line): line is CartLine =>
        typeof line?.productId === 'number' && typeof line?.quantity === 'number' && line.quantity > 0,
    )
  } catch {
    return []
  }
}

function saveGuestCart(lines: CartLine[] | null) {
  writeStorage(STORAGE_KEY, lines ? JSON.stringify(lines) : null)
}

const pendingLoads = new Map<number, Promise<CartLine[]>>()

function loadAccountCart(userId: number): Promise<CartLine[]> {
  const pending = pendingLoads.get(userId)
  if (pending) return pending

  const guestLines = loadGuestCart()
  const request = (
    guestLines.length > 0
      ? apiFetch<CartLine[]>('/api/cart/merge', { method: 'POST', body: { items: guestLines } })
      : apiFetch<CartLine[]>('/api/cart')
  )
    .then((serverLines) => {
      saveGuestCart(null)
      return serverLines
    })
    .finally(() => pendingLoads.delete(userId))

  pendingLoads.set(userId, request)
  return request
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const { products } = useProducts()
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const [lines, setLines] = useState<CartLine[]>(() => (userId ? [] : loadGuestCart()))
  const [status, setStatus] = useState<'loading' | 'ready'>(userId ? 'loading' : 'ready')
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [prevUserId, setPrevUserId] = useState(userId)
  if (userId !== prevUserId) {
    setPrevUserId(userId)
    setLines(userId ? [] : loadGuestCart())
    setStatus(userId ? 'loading' : 'ready')
    setIsCartOpen(false)
  }

  const userIdRef = useRef(userId)
  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let ignore = false

    loadAccountCart(userId)
      .then((serverLines) => {
        if (!ignore) setLines(serverLines)
      })
      .catch(() => {
        if (!ignore) setLines(loadGuestCart())
      })
      .finally(() => {
        if (!ignore) setStatus('ready')
      })

    return () => {
      ignore = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId) saveGuestCart(lines)
  }, [lines, userId])

  function sync(request: () => Promise<CartLine[]>) {
    if (!userId) return
    const forUser = userId
    const apply = (serverLines: CartLine[]) => {
      if (userIdRef.current === forUser) setLines(serverLines)
    }
    request()
      .then(apply)
      .catch(() =>
        apiFetch<CartLine[]>('/api/cart')
          .then(apply)
          .catch(() => {}),
      )
  }

  function addToCart(product: Product, quantity = 1) {
    const existing = lines.find((line) => line.productId === product.id)
    const next = Math.min((existing?.quantity ?? 0) + quantity, product.stock)
    setLines((prev) =>
      existing
        ? prev.map((line) => (line.productId === product.id ? { ...line, quantity: next } : line))
        : [...prev, { productId: product.id, quantity: next }],
    )
    sync(() => apiFetch(`/api/cart/${product.id}`, { method: 'PUT', body: { quantity: next } }))
    setIsCartOpen(true)
  }

  function removeFromCart(productId: number) {
    setLines((prev) => prev.filter((line) => line.productId !== productId))
    sync(() => apiFetch(`/api/cart/${productId}`, { method: 'DELETE' }))
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    const next = Math.min(quantity, productsById.get(productId)?.stock ?? 0)
    setLines((prev) => prev.map((line) => (line.productId === productId ? { ...line, quantity: next } : line)))
    sync(() => apiFetch(`/api/cart/${productId}`, { method: 'PUT', body: { quantity: next } }))
  }

  function clearCart() {
    setLines([])
    sync(() => apiFetch('/api/cart', { method: 'DELETE' }))
  }

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

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
        status,
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
