import { useEffect, useState } from 'react'
import { searchApi } from '../api/client'
export default function TrendingSearches({ onSelect }) {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    searchApi
      .getTrending(8)
      .then((data) => setTrending(data || []))
      .catch(() => setTrending([]))
  }, [])

  if (trending.length === 0) return null

  return (
    <div className="mt-10 text-center">
      <h3 className="text-sm text-gray-500 mb-3 font-normal">
        🔥 Trending searches
      </h3>
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
        {trending.map((t) => (
          <button
            key={t.query}
            onClick={() => onSelect?.(t.query)}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full
                       text-sm text-gray-800 transition-colors"
          >
            {t.query}
          </button>
        ))}
      </div>
    </div>
  )
}