import { useCallback, useEffect, useState } from 'react'
import { searchApi } from '../api/client'

export function useSearch(query, options = {}) {
  
  const { enabled = true, limit = 10 } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {

    if (!query || !enabled) return;

    setLoading(true)
    setError(null)

    try {
      const res = await searchApi.search(query, limit)
      setData(res)
    } catch (err) {
      console.error('Search failed:', err)
      setError(err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [query, enabled, limit])

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, refetch: run }
}