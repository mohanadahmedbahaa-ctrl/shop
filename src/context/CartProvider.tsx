import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '../api/client'
import type { Product } from '../data/products'
import { useAuth } from './AuthContext'
import { CartContext, type CartItem, type CartLine } from './CartContext'
import { useProducts } from './ProductsContext'

const STORAGE_KEY = 'oakline-cart'

// TWO MODES:
//   guest      -> the cart lives in localStorage (this browser only)
//   logged in  -> the cart lives in the DATABASE (GET/PUT/DELETE /api/cart), on every device
// At login, the guest cart is MERGED into the account's cart, then removed from localStorage.

// 1. Load the guest cart. localStorage data is UNTRUSTED (old format, edited by hand...),
//    so we validate the SHAPE of each line. Lines for products that no longer exist are
//    dropped later, in step 7.
function loadGuestCart(): CartLine[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
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
  try {
    if (lines) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked or full: the cart still works for this visit.
  }
}

// 1b. Load a logged-in user's cart, merging the guest cart in first (if there is one).
//     BUG THIS PREVENTS: in development, React's StrictMode runs every effect TWICE (mount,
//     unmount, mount) to expose effects that aren't safe to repeat. Merging is NOT safe to
//     repeat: it ADDS quantities, so 2 lamps became 4. So we remember the request that's
//     already on its way (per user) and the second run reuses it instead of sending another.
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
      saveGuestCart(null) // merged: the guest copy is no longer needed
      return serverLines
    })
    .finally(() => pendingLoads.delete(userId))

  pendingLoads.set(userId, request)
  return request
}

// 2. THE KEY TRICK: when the user logs in or out, `key` changes, so React throws away the old
//    CartStore and mounts a fresh one with fresh state. No need to "reset" anything by hand,
//    and the guest's and the account's carts can never mix by accident.
//    (Same trick as <ProductDetails key={product.id}> on the product page.)
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return (
    <CartStore key={user ? `user-${user.id}` : 'guest'} userId={user?.id ?? null}>
      {children}
    </CartStore>
  )
}

function CartStore({ userId, children }: { userId: number | null; children: ReactNode }) {
  // The catalog comes from the API (ProductsProvider wraps this provider).
  // A Map gives fast lookup by id; useMemo rebuilds it only when `products` changes.
  const { products } = useProducts()
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  // 3. Lazy initial state. A guest starts with the saved cart right away; a logged-in user
  //    starts empty and 'loading' until the server answers (checkout waits for 'ready').
  const [lines, setLines] = useState<CartLine[]>(() => (userId ? [] : loadGuestCart()))
  const [status, setStatus] = useState<'loading' | 'ready'>(userId ? 'loading' : 'ready')
  const [isCartOpen, setIsCartOpen] = useState(false)

  // 4. LOGGED IN: load the account's cart once. If there's a guest cart, merge it in first.
  useEffect(() => {
    if (!userId) return
    let ignore = false

    loadAccountCart(userId)
      .then((serverLines) => {
        if (!ignore) setLines(serverLines)
      })
      .catch(() => {
        // Server unreachable: at least show the guest cart (still saved, since the merge
        // didn't happen); the next change retries the server.
        if (!ignore) setLines(loadGuestCart())
      })
      .finally(() => {
        if (!ignore) setStatus('ready')
      })

    return () => {
      ignore = true
    }
  }, [userId])

  // 5. GUEST: save to localStorage whenever `lines` changes. Logged-in carts are NOT saved
  //    here (the database has them), so after logout the browser shows an empty guest cart.
  useEffect(() => {
    if (!userId) saveGuestCart(lines)
  }, [lines, userId])

  // 6. OPTIMISTIC UPDATES: change the screen IMMEDIATELY, then tell the server.
  //    The server answers with the whole cart (its version is the truth: it caps quantities at
  //    the real stock), and we replace our state with it. If the request fails, we reload the
  //    server's cart so the screen never shows something that wasn't saved.
  function sync(request: () => Promise<CartLine[]>) {
    if (!userId) return // guests: localStorage only (step 5)
    request()
      .then(setLines)
      .catch(() =>
        apiFetch<CartLine[]>('/api/cart')
          .then(setLines)
          .catch(() => {}),
      )
  }

  // IMMUTABLE updates: always build a NEW array, never push or mutate.
  // Math.min(..., stock) means you can't add more than is in stock.
  function addToCart(product: Product, quantity = 1) {
    const existing = lines.find((line) => line.productId === product.id)
    const next = Math.min((existing?.quantity ?? 0) + quantity, product.stock)
    setLines((prev) =>
      existing
        ? prev.map((line) => (line.productId === product.id ? { ...line, quantity: next } : line))
        : [...prev, { productId: product.id, quantity: next }],
    )
    // PUT sets the quantity (idempotent), so we send the final number, not "+1".
    sync(() => apiFetch(`/api/cart/${product.id}`, { method: 'PUT', body: { quantity: next } }))
    // Good e-commerce UX: show the user what happened by opening the cart drawer.
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

  // useCallback keeps the SAME function between renders. The drawer uses closeCart inside a
  // useEffect dependency list; a new function every render would re-run that effect.
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
