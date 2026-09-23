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
      .filter(Boolean)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

    if (terms.length === 0) return text

    const regex = new RegExp(`(${terms.join('|')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    )
  }

  return (
    <article className="mb-7">
      <div className="text-xs text-gray-600 mb-1 truncate">{result.url}</div>
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="text-glilink text-lg font-normal hover:underline leading-snug block mb-1 text-[#1a0dab]"
      >
        {highlight(result.title) || result.url}
      </a>
      <p className="text-[#4d5156] text-sm leading-relaxed">
        {highlight(result.snippet)}
      </p>
      <div className="text-[11px] text-gray-400 mt-1">
        Score: {result.score?.toFixed(2)}
      </div>
    </article>
  )
}