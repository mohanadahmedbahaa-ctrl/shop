import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiFetch } from '../api/client'
import type { Product } from '../data/products'
import { ProductsContext, type LoadStatus } from './ProductsContext'

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    apiFetch<Product[]>('/api/products')
      .then((data) => {
        if (ignore) return
        setProducts(data)
        setStatus('ready')
      })
      .catch((err: Error) => {
        if (ignore) return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  const refresh = useCallback(() => {
    apiFetch<Product[]>('/api/products')
      .then(setProducts)
      .catch(() => {})
  }, [])

  const addProductToList = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product])
  }, [])

  const removeProductFromList = useCallback((id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <ProductsContext.Provider value={{ products, status, error, reload, refresh, addProductToList, removeProductFromList }}>
      {children}
    </ProductsContext.Provider>
  )
}
