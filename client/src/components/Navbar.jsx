import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { searchApi } from '../api/client'

export default function Navbar() {
  const location = useLocation()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    searchApi
      .getStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl font-semibold tracking-tight text-gray-900 group-hover:opacity-90">
            Mini<span className="gradient-text font-bold">Search</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            v1.0
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {stats && stats.documentsIndexed > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{stats.documentsIndexed.toLocaleString()} pages indexed</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Search
            </Link>

            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>🕷️</span>
              <span>Crawler / Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
