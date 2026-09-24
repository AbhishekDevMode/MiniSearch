import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

export default function Header({ query }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-6 flex-1">
          <Link
            to="/"
            className="text-2xl font-semibold tracking-tight whitespace-nowrap hover:opacity-85"
          >
            Mini<span className="gradient-text font-bold">Search</span>
          </Link>

          <SearchBar
            initialValue={query}
            size="small"
            onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
          />
        </div>

        <Link
          to="/admin"
          className="text-xs font-medium text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors hidden sm:flex items-center gap-1.5"
        >
          <span>🕷️</span> Admin Console
        </Link>
      </div>
    </header>
  )
}