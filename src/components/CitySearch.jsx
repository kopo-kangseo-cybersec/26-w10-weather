import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 400ms 디바운스 검색
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setIsSearching(false)
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(trimmed)
        setResults(data || [])
        setIsOpen(true)
      } catch (err) {
        console.error('도시 검색 오류:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item) => {
    const cityName = item.country
      ? `${item.name} (${item.admin1 || item.country})`
      : item.name

    onSelectCity({
      name: cityName,
      lat: item.latitude,
      lon: item.longitude,
    })
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container retro-window" ref={containerRef}>
      <div className="retro-titlebar">
        <span className="title-text">FIND_CITY.COM</span>
        <div className="titlebar-controls">
          <span className="win-btn">?</span>
        </div>
      </div>
      <div className="search-input-wrapper retro-content">
        <Search className="search-icon" size={16} />
        <span className="cli-prompt">C:\&gt;</span>
        <input
          type="text"
          className="search-input retro-input"
          placeholder="검색 도시명 입력 (예: Seoul, Tokyo, London)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {isSearching && <Loader2 className="search-spinner" size={16} />}
        {!isSearching && query && (
          <button
            type="button"
            className="search-clear-btn retro-btn"
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="search-results-dropdown retro-dropdown">
          {results.length > 0 ? (
            results.map((item) => (
              <li key={`${item.id}-${item.latitude}-${item.longitude}`}>
                <button
                  type="button"
                  className="search-result-item"
                  onClick={() => handleSelect(item)}
                >
                  <MapPin size={16} className="item-pin" />
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-detail">
                      [{[item.admin1, item.country].filter(Boolean).join(', ')}]
                    </span>
                  </div>
                </button>
              </li>
            ))
          ) : (
            !isSearching && query.trim().length >= 2 && (
              <li className="search-no-result">
                <span>[ERROR 404] 검색 결과가 없습니다. 영문 도시명으로 시도하세요.</span>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}
