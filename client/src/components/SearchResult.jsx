import { searchApi } from '../api/client'

export default function SearchResult({ result, query, position }) {
  const handleClick = async () => {
    try {
      await searchApi.logClick(query, result.docId, position)
    } catch (err) {
      console.warn('Click log failed:', err)
    }
  }

  const highlight = (text) => {
    if (!text || !query) return text
    const terms = query
      .split(/\s+/)
      .filter((t) => t.length > 1)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

    if (terms.length === 0) return text

    const regex = new RegExp(`(${terms.join('|')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    )
  }

  // Extract domain for display
  let domain = ''
  try {
    domain = new URL(result.url).hostname
  } catch {
    domain = result.url
  }

  return (
    <article className="mb-6 max-w-2xl group">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-mono">
          🌐
        </span>
        <span className="text-xs text-gray-600 truncate">{domain}</span>
        <span className="text-xs text-gray-400 truncate max-w-xs">{result.url}</span>
      </div>

      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="text-[#1a0dab] text-xl font-normal hover:underline leading-snug block mb-1.5"
      >
        {highlight(result.title) || result.url}
      </a>

      <p className="text-[#4d5156] text-sm leading-relaxed mb-2">
        {highlight(result.snippet)}
      </p>

      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
          BM25 score: {result.score?.toFixed(3)}
        </span>
        <span>Rank #{position}</span>
      </div>
    </article>
  )
}