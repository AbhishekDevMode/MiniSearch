import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="font-semibold text-gray-700">MiniSearch</span> · Full-stack Search Engine powered by Lucene & BM25
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link to="/admin" className="hover:text-blue-600 transition-colors">
            Crawler Admin
          </Link>
          <span>Spring Boot 3 + React 19</span>
        </div>
      </div>
    </footer>
  )
}