import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, MapPin } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (!val || val.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      setIsOpen(false)
    } else {
      setIsSearching(true)
    }
  }

  // 💡 사이버보안 체크포인트: API 부하 및 429 차단 방지를 위한 400ms 디바운스(Debounce)
  useEffect(() => {
    if (!query || query.trim().length < 2) return

    const debounceTimer = setTimeout(async () => {
      try {
        const data = await searchCities(query.trim())
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('도시 검색 오류:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400) // 400ms 대기 후 1회만 HTTPS 호출

    return () => clearTimeout(debounceTimer)
  }, [query])

  // 외부 클릭 시 검색 결과 드롭다운 닫기
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSelect = (item) => {
    const countryLabel = item.country || item.country_code || ''
    const regionLabel = item.admin1 ? `${item.admin1}, ` : ''
    const formattedName = `${item.name} (${regionLabel}${countryLabel})`

    onSelectCity({
      name: formattedName,
      lat: item.latitude,
      lon: item.longitude,
    })

    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrap">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="전 세계 도시 검색 (예: Seoul, Tokyo, Paris, New York)..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {isSearching && <Loader2 size={16} className="search-spinner spinning" />}
        {!isSearching && query && (
          <button
            type="button"
            className="clear-query-btn"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((item) => (
                <li key={`${item.id}-${item.latitude}-${item.longitude}`}>
                  <button
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelect(item)}
                  >
                    <MapPin size={16} className="result-pin" />
                    <div className="result-text">
                      <span className="result-name">{item.name}</span>
                      <span className="result-sub">
                        {[item.admin1, item.country].filter(Boolean).join(', ')}
                        <small className="result-coords">
                          ({item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°)
                        </small>
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !isSearching &&
            query.trim().length >= 2 && (
              <div className="search-no-results">
                <span>일치하는 도시를 찾지 못했습니다. 영문 철자를 확인해 주세요.</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
