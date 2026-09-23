import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

export default function SearchBar({
  initialValue = "",
  onSearch,
  autoFocus = false,
  size = "large",
  showSuggestions = true,
}) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showBox, setShowBox] = useState(false);
  const inputRef = useRef(null);
  const debounced = useDebounce(value, 200);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Fetch suggestions from trending endpoint
  useEffect(() => {
    if (!showSuggestions || !debounced || debounced.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    fetch(`/api/analytics/trending?limit=20`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const filtered = data
          .map((d) => d.query)
          .filter((q) => q && q.toLowerCase().includes(debounced.toLowerCase()))
          .slice(0, 6);
        setSuggestions(filtered);
      })
      .catch(() => setSuggestions([]));

    return () => {
      cancelled = true;
    };
  }, [debounced, showSuggestions]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setShowBox(false);
    onSearch?.(trimmed);
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        setValue(suggestions[activeIndex]);
        onSearch?.(suggestions[activeIndex]);
        setShowBox(false);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setShowBox(false);
    }
  };

  const large = size === "large";

  return (
    <div className={`relative w-full ${large ? "max-w-2xl" : "max-w-xl"}`}>
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          placeholder={large ? "Search the web..." : "Search..."}
          className="input-search flex-1"
          onChange={(e) => {
            setValue(e.target.value);
            setShowBox(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKey}
          onFocus={() => setShowBox(true)}
          onBlur={() => setTimeout(() => setShowBox(false), 150)}
        />
        <button onClick={submit} className="btn-primary whitespace-nowrap">
          Search
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showBox && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-lg overflow-hidden z-50">
          {suggestions.map((s, i) => (
            <div
              key={s}
              className={`px-5 py-3 cursor-pointer text-sm transition-colors ${
                i === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                setValue(s);
                onSearch?.(s);
                setShowBox(false);
              }}
            >
              🔍 {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
