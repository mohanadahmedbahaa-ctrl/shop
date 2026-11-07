import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '../data/products'
import { CartContext } from './CartContext'
import type { CartItem } from './CartContext'

const STORAGE_KEY = 'shop-cart'

// 1. Read the saved cart from localStorage (same idea as your portfolio's theme toggle).
//    try/catch, because localStorage can be blocked or hold broken JSON.
function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as CartItem[]) : []
  } catch {
    return []
  }
}

// 2. `children` is a special prop: whatever you put BETWEEN the tags,
//    e.g. <CartProvider><App /></CartProvider>, so here children = <App />.
//    ReactNode is the type for "anything React can render".
type Props = {
  children: ReactNode
}

export function CartProvider({ children }: Props) {
  // 3. useState = data that, when changed, re-renders the components that use it.
  //    It returns [currentValue, setterFunction].
  //    Passing a FUNCTION (loadCart) instead of loadCart() is "lazy initialization":
  //    React calls it only once, on the first render, not on every render.
  const [items, setItems] = useState<CartItem[]>(loadCart)

  // 4. useEffect runs AFTER render. The [items] array is the DEPENDENCY list:
  //    "run this again every time `items` changes". Here it saves the cart.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full or blocked: the cart still works, it just won't be saved.
    }
  }, [items])

  // 5. IMMUTABILITY: never change state directly (no items.push(...)).
  //    Always build a NEW array/object and pass it to the setter.
  //    React compares old and new by reference; if you mutate, it may not re-render.
  //
  //    setItems(prev => ...) is the "updater" form: `prev` is always the latest state,
  //    which is safer than using `items` when the new value depends on the old one.
  function addToCart(product: Product) {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        // Already in the cart: copy every item, but +1 the matching one.
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 } // spread = copy, then override quantity
            : item,
        )
      }
      // Not in the cart yet: new array = old items + the new one.
      return [...prev, { product, quantity: 1 }]
    })
  }

  // .filter() returns a NEW array without the removed product.
  function removeFromCart(productId: number) {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) {
      removeFromCart(productId) // going below 1 removes the line
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    )
  }

  function clearCart() {
    setItems([])
  }

  // 6. DERIVED values: calculated from state on every render, NOT stored in their own useState.
  //    Storing them separately could get out of sync. Rule: don't duplicate state.
  //    .reduce() boils an array down to one value; 0 is the starting total.
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  // 7. The Provider makes `value` available to every component inside it.
  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
