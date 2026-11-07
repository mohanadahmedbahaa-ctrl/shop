import { createContext, useContext } from 'react'
import type { Product } from '../data/products'

export type LoadStatus = 'loading' | 'error' | 'ready'

type ProductsContextValue = {
  products: Product[]
  status: LoadStatus
  error: string | null
  reload: () => void
  refresh: () => void
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
