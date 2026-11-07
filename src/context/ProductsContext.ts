// The product catalog, loaded ONCE from the API and shared with every page.
// Same pattern as the cart: this file = context + types + hook, ProductsProvider.tsx = the state.
import { createContext, useContext } from 'react'
import type { Product } from '../data/products'

// 1. Every network request has 3 possible states. A union type makes it impossible to be
//    "loading" and "error" at the same time (two separate booleans could get out of sync).
export type LoadStatus = 'loading' | 'error' | 'ready'

export type ProductsContextValue = {
  products: Product[]
  status: LoadStatus
  error: string | null
  reload: () => void
  // Re-download in the BACKGROUND (no loading screen), e.g. after an order changed the stock.
  refresh: () => void
  // Keep the shared list in sync after the dashboard creates or deletes a product,
  // without downloading the whole catalog again.
  addProductToList: (product: Product) => void
  removeProductFromList: (id: number) => void
}

export const ProductsContext = createContext<ProductsContextValue | null>(null)

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext)
  if (context === null) {
    throw new Error('useProducts() must be used inside <ProductsProvider>')
  }
  return context
}
