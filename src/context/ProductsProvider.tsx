import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiFetch } from '../api/client'
import type { Product } from '../data/products'
import { ProductsContext, type LoadStatus } from './ProductsContext'

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  // Changing this number re-runs the effect below: that's how "Try again" works.
  const [attempt, setAttempt] = useState(0)

  // 1. FETCHING DATA in useEffect: runs after the first render, and again when `attempt` changes.
  useEffect(() => {
    // 2. The `ignore` flag handles a RACE: if the effect re-runs (or the component unmounts)
    //    before the old request finishes, the old answer is ignored instead of overwriting
    //    newer state. (StrictMode runs effects twice in development, so this matters.)
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
      ignore = true // cleanup
    }
  }, [attempt])

  // 3. Setting state inside an event handler (not inside the effect body) keeps the
  //    react-hooks lint rules happy and makes the "loading" step explicit.
  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  // Unlike reload(), the status stays 'ready': the page keeps showing the old list until the
  // new one arrives. Errors are ignored; the current list is still good enough.
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
