import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { searchApi } from '../api/client'
import SearchBar from '../components/SearchBar'
import SearchResult from '../components/SearchResult'
import Loader from '../components/Loader'

const PAGE_SIZE = 10

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const query = searchParams.get('q') || ''
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query.trim()) {
      setData(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    searchApi
      .search(query.trim(), PAGE_SIZE, offset)
      .then((res) => {
        if (isMounted) {
          setData(res)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Search request failed')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [query, offset])

  const handleNewSearch = (newQuery) => {
    setSearchParams({ q: newQuery, offset: '0' })
  }

  const handlePageChange = (newOffset) => {
    setSearchParams({ q: query, offset: newOffset.toString() })
  }

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1
  const totalResults = data?.totalResults || 0
  const totalPages = Math.ceil(totalResults / PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top search header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
          <Link to="/" className="text-2xl font-medium tracking-tight whitespace-nowrap">
            Mini<span className="gradient-text font-bold">Search</span>
          </Link>

          <div className="flex-1 max-w-2xl">
            <SearchBar
              initialValue={query}
              size="small"
              onSearch={handleNewSearch}
              placeholder="Search..."
            />
          </div>

          <div className="hidden md:flex items-center gap-3 ml-auto">
            <Link
              to="/admin"
              className="text-xs font-medium text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <span>🕷️</span> Admin Console
            </Link>
          </div>
        </div>
      </header>

      {/* Main search content area */}
      <main className="max-w-6xl mx-auto px-6 py-4 flex-1 w-full">
        {/* Search statistics */}
        {data && !loading && (
          <div className="text-xs text-gray-500 mb-5">
            About {data.totalResults.toLocaleString()} results ({((data.responseTimeMs || 0) / 1000).toFixed(3)} seconds)
          </div>
        )}

        {/* Suggestions / Did you mean */}
        {data?.suggestions && data.suggestions.length > 0 && (
          <div className="mb-6 p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-blue-800">Related queries:</span>
            {data.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleNewSearch(s)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-2xs"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && <Loader text={`Searching for "${query}"...`} />}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-xl my-6">
            <p className="font-semibold mb-1">Search Error</p>
            <p>{error}</p>
            <button
              onClick={() => handleNewSearch(query)}
              className="mt-3 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results List */}
        {!loading && !error && data && data.results && data.results.length > 0 && (
          <div className="space-y-2">
            {data.results.map((result, idx) => (
              <SearchResult
                key={result.docId || idx}
                result={result}
                query={query}
                position={offset + idx + 1}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-8 pb-12 flex items-center gap-2">
                <button
                  disabled={offset === 0}
                  onClick={() => handlePageChange(Math.max(0, offset - PAGE_SIZE))}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pageNum = i + 1
                    const pageOffset = i * PAGE_SIZE
                    const isCurrent = pageNum === currentPage
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageOffset)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(offset + PAGE_SIZE)}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data && (!data.results || data.results.length === 0) && (
          <div className="py-12 max-w-xl">
            <h2 className="text-xl font-medium text-gray-900 mb-3">
              Your search - <span className="font-semibold">{query}</span> - did not match any documents.
            </h2>
            <div className="text-sm text-gray-600 space-y-2 mt-4">
              <p className="font-medium text-gray-700">Suggestions:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure all words are spelled correctly.</li>
                <li>Try different or more general keywords.</li>
                <li>Try fewer keywords.</li>
              </ul>
              <div className="pt-6">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>🕷️</span> Crawl new pages in the Admin Console →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty query state */}
        {!loading && !query && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-4">Please enter a search query above.</p>
            <Link to="/" className="btn-primary">
              Go to Home Page
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
