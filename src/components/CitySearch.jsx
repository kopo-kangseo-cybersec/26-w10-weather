import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const containerRef = useRef(null)

  // 400ms 디바운스(Debounce) 적용
  // 사용자의 빠른 타이핑 시 매 글자마다 API가 호출되어 429 Too Many Requests가 발생하는 것을 방어
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      setResults([])
      setIsSearching(false)
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(trimmed)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('도시 검색 오류:', err)
        setSearchError('도시 목록을 불러오지 못했습니다.')
      } finally {
        setIsSearching(false)
      }
    }, 400) // 400ms 디바운스

    return () => clearTimeout(timer)
  }, [query])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item) => {
    const cityName = item.country
      ? `${item.name} (${item.country})`
      : item.name

    onSelectCity({
      name: cityName,
      lat: item.latitude,
      lon: item.longitude,
    })
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 이름으로 검색 (예: Seoul, Tokyo, Paris, London...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />

        {isSearching && (
          <Loader2 size={18} className="search-spinner spinning" />
        )}

        {query && !isSearching && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 드롭다운 결과 */}
      {isOpen && (
        <div className="search-dropdown">
          {searchError && (
            <div className="dropdown-message error">{searchError}</div>
          )}

          {!searchError && results.length === 0 && !isSearching && query.trim().length >= 2 && (
            <div className="dropdown-message">검색 결과가 없습니다.</div>
          )}

          {!searchError && results.length > 0 && (
            <ul className="search-results-list">
              {results.map((item) => (
                <li key={`${item.id}-${item.latitude}-${item.longitude}`}>
                  <button
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelect(item)}
                  >
                    <MapPin size={16} className="item-pin" />
                    <div className="item-details">
                      <strong className="item-name">{item.name}</strong>
                      <span className="item-sub">
                        {[item.admin1, item.country].filter(Boolean).join(', ')} (위도 {item.latitude.toFixed(2)}°, 경도 {item.longitude.toFixed(2)}°)
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

