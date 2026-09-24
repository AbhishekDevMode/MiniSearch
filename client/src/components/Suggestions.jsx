export default function Suggestions({
  suggestions = [],
  activeIndex = -1,
  onSelect,
  visible = false,
}) {
  if (!visible || suggestions.length === 0) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
      <ul className="py-2">
        {suggestions.map((suggestion, index) => {
          const isActive = index === activeIndex
          return (
            <li
              key={`${suggestion}-${index}`}
              className={`px-5 py-2.5 cursor-pointer text-sm flex items-center gap-3 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect?.(suggestion)
              }}
            >
              <span className="text-gray-400 text-xs">🔍</span>
              <span className="truncate">{suggestion}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
