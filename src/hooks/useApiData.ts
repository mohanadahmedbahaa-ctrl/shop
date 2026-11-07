import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

// A CUSTOM HOOK that loads data from one API path:
//   const { data, status, error, reload, setData } = useApiData<Order[]>('/api/orders/mine')
// It packages the "fetch in useEffect + loading/error state + ignore stale answers" pattern
// (see ProductsProvider for the long version), so each page doesn't repeat it.
// Custom hooks are just functions whose name starts with "use" and that call other hooks.
export function useApiData<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    apiFetch<T>(path)
      .then((result) => {
        if (ignore) return
        setData(result)
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
  }, [path, attempt]) // re-runs if the path changes or reload() is called

  // Re-fetch in the background: the old data stays on screen until the new data arrives.
  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  // setData is returned too, so a page can update the list right after a PATCH,
  // without waiting for a full reload.
  return { data, status, error, reload, setData }
}
