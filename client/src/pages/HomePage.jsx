import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import TrendingSearches from '../components/TrendingSearches'
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
    if (!q || !q.trim()) return
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Brand title */}
      <div className="text-center mb-8">
        <h1 className="text-6xl md:text-7xl font-semibold tracking-tight text-gray-900 mb-2">
          Mini<span className="gradient-text font-bold">Search</span>
        </h1>
        <p className="text-sm md:text-base text-gray-500 font-normal">
          Lightweight, high-performance search engine powered by Lucene & BM25
        </p>
      </div>

      {/* Main search bar */}
      <div className="w-full flex justify-center mb-6">
        <SearchBar autoFocus onSearch={goSearch} size="large" />
      </div>

      {/* Live Index Statistics Pill */}
      {stats && (
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 bg-gray-50 border border-gray-200/80 px-4 py-2 rounded-full shadow-2xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <strong>{(stats.documentsIndexed ?? 0).toLocaleString()}</strong> documents indexed
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <strong>{(stats.totalSearches ?? 0).toLocaleString()}</strong> total searches
          </span>
          <span className="text-gray-300">|</span>
          <Link to="/admin" className="text-blue-600 hover:underline font-medium">
            Manage & Crawl →
          </Link>
        </div>
      )}

      {/* Trending searches */}
      <TrendingSearches onSelect={goSearch} />

      {/* Quick sample queries if no trending queries exist yet */}
      {(!stats || stats.totalSearches === 0) && (
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">
            Suggested Searches
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {['Spring Boot', 'Java 26', 'Lucene Tokenizer', 'BM25 Ranking', 'Web Crawler'].map(
              (term) => (
                <button
                  key={term}
                  onClick={() => goSearch(term)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Features showcase */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-2xl mb-2">🕷️</div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Polite Web Crawler</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Crawls websites domain-sensitively with full robots.txt compliance and automatic content deduplication.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-2xl mb-2">⚡</div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Inverted Index</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Powered by Apache Lucene tokenization and English analyzer for stemming and stop-word filtering.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-2xl mb-2">🎯</div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Okapi BM25 Ranking</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Information retrieval algorithm scoring document relevance via term frequency and inverse document frequency.
          </p>
        </div>
      </div>
    </div>
  )
}
