import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { searchApi } from '../api/client'
import Suggestions from './Suggestions'

export default function SearchBar({
  initialValue = '',
  onSearch,
  autoFocus = false,
  size = 'large',
  showSuggestions = true,
  placeholder,
}) {
  const [value, setValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showBox, setShowBox] = useState(false)
  const inputRef = useRef(null)
  const debounced = useDebounce(value, 200)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Fetch suggestions
  useEffect(() => {
    if (!showSuggestions || !debounced || debounced.trim().length < 2) {
      setSuggestions([])
      return
    }

    let cancelled = false
    searchApi
      .getSuggestions(debounced.trim(), 6)
      .then((data) => {
        if (!cancelled) {
          setSuggestions(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })

    return () => {
      cancelled = true
    }
  }, [debounced, showSuggestions])

  const submit = (queryToSubmit) => {
    const q = (queryToSubmit !== undefined ? queryToSubmit : value).trim()
    if (!q) return
    setShowBox(false)
    setActiveIndex(-1)
    onSearch?.(q)
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const selected = suggestions[activeIndex]
        setValue(selected)
        submit(selected)
      } else {
        submit()
      }
    } else if (e.key === 'Escape') {
      setShowBox(false)
    }
  }

  const handleSelect = (selected) => {
    setValue(selected)
    submit(selected)
  }

  const clearInput = () => {
    setValue('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  const isLarge = size === 'large'

  return (
    <div className={`relative w-full ${isLarge ? 'max-w-2xl' : 'max-w-xl'}`}>
      <div className="relative flex items-center">
        {/* Search icon prefix */}
        <div className="absolute left-4 text-gray-400 pointer-events-none select-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder || (isLarge ? 'Search documents, articles, topics...' : 'Search...')}
          className={`input-search pl-11 pr-24 ${isLarge ? 'py-3.5 text-base' : 'py-2.5 text-sm'}`}
          onChange={(e) => {
            setValue(e.target.value)
            setShowBox(true)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKey}
          onFocus={() => setShowBox(true)}
          onBlur={() => setTimeout(() => setShowBox(false), 200)}
        />

        {/* Action buttons inside search bar right side */}
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={clearInput}
              aria-label="Clear query"
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => submit()}
            className={`btn-primary ${isLarge ? 'px-5 py-2 text-sm' : 'px-4 py-1.5 text-xs'}`}
          >
            Search
          </button>
        </div>
      </div>

      <Suggestions
        suggestions={suggestions}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        visible={showBox}
      />
    </div>
  )
}
