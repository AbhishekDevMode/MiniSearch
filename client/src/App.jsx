import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import AdminPage from './pages/AdminPage'
import Footer from './components/Footer'

function App() {
  const location = useLocation()
  const isSearchPage = location.pathname === '/search'

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Show Navbar on non-search pages (search page has its own dedicated search bar header) */}
      {!isSearchPage && <Navbar />}

      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/crawler" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}

export default App
