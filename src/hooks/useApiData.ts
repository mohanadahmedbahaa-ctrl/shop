import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

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
  }, [path, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { data, status, error, reload, setData }
}
