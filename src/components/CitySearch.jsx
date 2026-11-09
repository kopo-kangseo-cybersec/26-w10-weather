import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { searchCities } from '../api/weather';

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // 400ms 디바운스 검색 (API 남용 및 429 에러 방지)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchCities(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('검색 실패:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim() || val.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsOpen(false);
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    // 도시명: 한글 또는 영문 + 국가/행정구역
    const displayName = city.admin1
      ? `${city.name} (${city.admin1}, ${city.country || ''})`
      : `${city.name} (${city.country || ''})`;

    onSelectCity({
      name: displayName,
      lat: city.latitude,
      lon: city.longitude,
    });

    setQuery('');
    setIsOpen(false);
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="city-search-container" ref={searchContainerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="전 세계 도시 검색 (예: Seoul, Tokyo, Paris, London...)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isSearching && <Loader2 size={18} className="search-spinner" />}
        {!isSearching && query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={clearQuery}
            aria-label="검색어 지우기"
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
                <li key={item.id} className="search-result-item">
                  <button
                    type="button"
                    className="search-item-btn"
                    onClick={() => handleSelect(item)}
                  >
                    <MapPin size={16} className="item-pin" />
                    <div className="item-text">
                      <strong className="item-name">{item.name}</strong>
                      <span className="item-sub">
                        {[item.admin1, item.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-empty">
              <span>검색 결과가 없습니다. (영문 도시명으로 입력해 보세요)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
