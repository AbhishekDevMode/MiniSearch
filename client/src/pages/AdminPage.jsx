import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { searchApi } from '../api/client'

export default function AdminPage() {
  const [seedUrl, setSeedUrl] = useState('https://spring.io/blog')
  const [maxPages, setMaxPages] = useState(20)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [reindexing, setReindexing] = useState(false)
  const [stats, setStats] = useState(null)

  // Document explorer state
  const [documents, setDocuments] = useState([])
  const [docPage, setDocPage] = useState(0)
  const [totalDocs, setTotalDocs] = useState(0)
  const [docsLoading, setDocsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      const data = await searchApi.getStats()
      setStats(data)
    } catch (err) {
      console.warn('Failed to load stats:', err)
    }
  }, [])

  const fetchDocuments = useCallback(async (page = 0) => {
    setDocsLoading(true)
    try {
      const data = await searchApi.getDocuments(page, 10)
      setDocuments(data.content || [])
      setTotalDocs(data.totalElements || 0)
      setDocPage(page)
    } catch (err) {
      console.warn('Failed to load documents:', err)
    } finally {
      setDocsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchDocuments(0)
  }, [fetchStats, fetchDocuments])

  const crawl = async () => {
    const trimmed = seedUrl.trim()
    if (!trimmed) {
      setError('Please provide a valid seed URL')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setActionMessage(null)

    try {
      const data = await searchApi.crawl(trimmed, Math.max(1, Number(maxPages)))
      setResult(data)
      setActionMessage(`Successfully crawled and indexed ${data.pagesIndexed} pages!`)
      fetchStats()
      fetchDocuments(0)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Crawl failed')
    } finally {
      setLoading(false)
    }
  }

  const reindex = async () => {
    setReindexing(true)
    setActionMessage(null)
    try {
      const data = await searchApi.reindex()
      setActionMessage(`✅ Inverted index successfully rebuilt! ${data.indexed} documents in memory.`)
      fetchStats()
    } catch (err) {
      setError(`Reindex failed: ${err.message}`)
    } finally {
      setReindexing(false)
    }
  }

  const deleteDoc = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || id}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      await searchApi.deleteDocument(id)
      setActionMessage(`Document #${id} removed. Rebuilding index...`)
      await searchApi.reindex()
      fetchStats()
      fetchDocuments(docPage)
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const sampleUrls = [
    'https://spring.io/blog',
    'https://developer.mozilla.org',
    'https://react.dev/blog',
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl font-semibold tracking-tight text-gray-900">
              Mini<span className="gradient-text font-bold">Search</span>
            </Link>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
              Admin Console
            </span>
          </div>
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
          >
            ← Back to Search
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-8 w-full flex-1 space-y-6">
        {/* Banner notification */}
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between shadow-2xs">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* System Overview KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
              Documents in Database
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {(stats?.documentsInDb ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">MySQL Persistent Storage</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
              In-Memory Index Size
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {(stats?.documentsIndexed ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Ready for BM25 Ranking</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
              Total Searches Logged
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {(stats?.totalSearches ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Analytics & Trending data</div>
          </div>
        </section>

        {/* Crawler Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>🕷️</span> Web Crawler
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              Robots.txt Enforced
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Enter a seed URL to start recursive crawling. The crawler respects <code>robots.txt</code>,
            stays within the same domain, avoids duplicate pages via SHA-256 content hashes, and indexes
            each crawled page into the BM25 search engine.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Seed URL
              </label>
              <input
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                value={seedUrl}
                onChange={(e) => setSeedUrl(e.target.value)}
                placeholder="https://example.com/blog"
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">Presets:</span>
                {sampleUrls.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSeedUrl(url)}
                    className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded"
                  >
                    {new URL(url).hostname}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                <span>Maximum Pages to Crawl</span>
                <span className="font-mono text-blue-600 font-bold text-sm">{maxPages} pages</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>5 pages</span>
                <span>50 pages</span>
                <span>100 pages</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={crawl}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner w-4 h-4 border-2 border-white border-t-transparent"></span>
                    Crawling & Indexing...
                  </span>
                ) : (
                  'Start Crawler Job'
                )}
              </button>

              {loading && (
                <span className="text-xs text-gray-500 animate-pulse">
                  Crawling up to {maxPages} pages. Please wait...
                </span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                ❌ {error}
              </div>
            )}

            {result && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 text-sm space-y-2">
                <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <span>✅</span> Crawl Job Completed Successfully
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-gray-500">Pages Crawled</div>
                    <div className="text-base font-bold text-gray-900">{result.pagesCrawled}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-gray-500">Pages Indexed</div>
                    <div className="text-base font-bold text-emerald-600">{result.pagesIndexed}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-gray-500">Duplicates Skipped</div>
                    <div className="text-base font-bold text-gray-900">{result.duplicatesSkipped}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-gray-500">Duration</div>
                    <div className="text-base font-bold text-gray-900">
                      {(result.durationMs / 1000).toFixed(2)}s
                    </div>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <details className="mt-3 text-xs text-gray-600">
                    <summary className="cursor-pointer font-medium text-amber-700 hover:underline">
                      View {result.errors.length} skipped / blocked URLs
                    </summary>
                    <ul className="list-disc ml-5 mt-2 space-y-0.5 text-gray-500 max-h-32 overflow-y-auto">
                      {result.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Index Management Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>🔁</span> In-Memory Index Management
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            MiniSearch indexes all crawled pages into an in-memory inverted index for sub-millisecond
            BM25 querying. If the backend server was restarted or pages were modified directly in MySQL,
            click below to rebuild the inverted index from all saved documents.
          </p>

          <button
            onClick={reindex}
            disabled={reindexing}
            className="btn-secondary"
          >
            {reindexing ? (
              <span className="flex items-center gap-2">
                <span className="spinner w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent"></span>
                Rebuilding Index...
              </span>
            ) : (
              '⚡ Rebuild In-Memory Index'
            )}
          </button>
        </section>

        {/* Documents Explorer Table */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>📚</span> Indexed Documents Repository
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Showing {documents.length} of {totalDocs.toLocaleString()} total documents in MySQL
              </p>
            </div>

            <button
              onClick={() => fetchDocuments(docPage)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              🔄 Refresh List
            </button>
          </div>

          {docsLoading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              No documents crawled yet. Run the crawler above to index your first web pages!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Title & URL</th>
                    <th className="py-3 px-3">Terms</th>
                    <th className="py-3 px-3">Crawled At</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 font-mono text-gray-500">#{doc.id}</td>
                      <td className="py-3 px-3 max-w-md">
                        <div className="font-medium text-gray-900 truncate">
                          {doc.title || 'Untitled Document'}
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block text-[11px]"
                        >
                          {doc.url}
                        </a>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono">
                        {doc.termCount?.toLocaleString() ?? '-'}
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {doc.crawledAt
                          ? new Date(doc.crawledAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => deleteDoc(doc.id, doc.title)}
                          disabled={deletingId === doc.id}
                          className="text-red-600 hover:text-red-800 font-medium text-xs disabled:opacity-50"
                        >
                          {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Document Pagination */}
              {totalDocs > 10 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <button
                    disabled={docPage === 0}
                    onClick={() => fetchDocuments(docPage - 1)}
                    className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-gray-500">
                    Page {docPage + 1} of {Math.ceil(totalDocs / 10)}
                  </span>
                  <button
                    disabled={(docPage + 1) * 10 >= totalDocs}
                    onClick={() => fetchDocuments(docPage + 1)}
                    className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
