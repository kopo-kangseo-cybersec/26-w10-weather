import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { searchCities } from '../api/weather';

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 400ms 디바운스(Debounce) 적용으로 API 남용 및 429 차단 방지
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(trimmed);
        setResults(cities);
        setIsOpen(true);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const locationLabel = [item.name, item.admin1, item.country]
      .filter(Boolean)
      .slice(0, 2)
      .join(', ');

    onSelectCity({
      name: locationLabel || item.name,
      lat: item.latitude,
      lon: item.longitude,
    });
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="city-search-wrapper" ref={containerRef}>
      <div className="city-search-input-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="city-search-input"
          placeholder="전 세계 도시 검색 (예: Seoul, Tokyo, London, Paris...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          aria-label="도시 검색"
        />
        {searching && <Loader2 size={18} className="spinner search-spinner" />}
        {!searching && query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <ul className="city-search-dropdown" role="listbox">
          {searching ? (
            <li className="city-search-empty">도시를 검색하고 있습니다...</li>
          ) : results.length === 0 ? (
            <li className="city-search-empty">
              검색 결과가 없습니다. 영문 도시명(예: Seoul, Busan, Tokyo)으로 입력해 보세요.
            </li>
          ) : (
            results.map((item) => (
              <li key={`${item.id}-${item.latitude}-${item.longitude}`}>
                <button
                  type="button"
                  className="city-search-item"
                  onClick={() => handleSelect(item)}
                >
                  <MapPin size={16} color="#2563eb" />
                  <div className="city-search-item-info">
                    <span className="city-search-item-name">{item.name}</span>
                    <span className="city-search-item-sub">
                      {[item.admin1, item.country].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <span className="city-search-coords">
                    {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
