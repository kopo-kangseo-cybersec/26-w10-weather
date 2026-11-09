import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchContainerRef = useRef(null)

  // 400ms 디바운스 적용: 연속 타이핑 시 API 요청 남용 및 429 차단 방지
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return
    }

    const timer = setTimeout(async () => {
      try {
        const searchRes = await searchCities(query.trim())
        setResults(searchRes)
        setIsOpen(true)
      } catch (err) {
        console.error('검색 요청 에러:', err)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      setIsOpen(false)
    } else {
      setIsLoading(true)
      setIsOpen(true)
    }
  }

  const handleSelect = (item) => {
    const displayName = `${item.name}${item.admin1 ? ` (${item.admin1})` : ''}`
    onSelectCity({
      name: displayName,
      lat: item.latitude,
      lon: item.longitude,
    })
    setQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={searchContainerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 검색 (예: Seoul, Busan, Tokyo, Paris...)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          aria-label="도시 검색"
        />
        {isLoading && <Loader2 size={16} className="search-loading-spin" />}
        {query && !isLoading && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            title="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="search-dropdown">
          {isLoading && results.length === 0 && (
            <div className="dropdown-message">검색 중...</div>
          )}
          {!isLoading && results.length === 0 && (
            <div className="dropdown-message">검색 결과가 없습니다. (영문 도시명을 입력해 보세요)</div>
          )}
          {results.length > 0 && (
            <ul className="dropdown-list">
              {results.map((item) => (
                <li
                  key={`${item.id}-${item.latitude}-${item.longitude}`}
                  className="dropdown-item"
                  onClick={() => handleSelect(item)}
                >
                  <MapPin size={16} className="item-icon" />
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-sub">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

