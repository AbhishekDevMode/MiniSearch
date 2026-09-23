import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import TrendingSearches from './TrendingSearches'
import { searchApi } from '../api/client'

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    searchApi
      .getStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const goSearch = (q) => {
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 gap-6">
      <h1 className="text-6xl md:text-7xl font-medium tracking-tight">
        Mini<span className="gradient-text">Search</span>
      </h1>

      <SearchBar autoFocus onSearch={goSearch} size="large" />

      {stats && (
        <div className="text-xs text-gray-500">
          {stats.documentsIndexed?.toLocaleString() ?? 0} documents indexed ·{' '}
          {stats.totalSearches?.toLocaleString() ?? 0} searches
        </div>
      )}

      <TrendingSearches onSelect={goSearch} />
    </div>
  )
}