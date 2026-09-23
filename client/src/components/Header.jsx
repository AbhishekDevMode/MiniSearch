import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

export default function Header({ query }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3">
        <Link
          to="/"
          className="text-2xl font-medium whitespace-nowrap hover:opacity-80"
        >
          Mini<span className="gradient-text">Search</span>
        </Link>

        <SearchBar
          initialValue={query}
          size="small"
          onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
        />
      </div>
    </header>
  )
}