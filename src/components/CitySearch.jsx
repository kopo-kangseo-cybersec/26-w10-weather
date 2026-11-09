import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { searchCities } from '../api/weather';

/**
 * 400ms 디바운스(Debounce) 적용 도시 검색 컴포넌트
 * 사이버보안 체크포인트: 사용자 입력 시 무분별한 요청을 제어하여 429 DoS 방어
 */
export default function CitySearch({ onSelectCity, currentCityName }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // 400ms 디바운스 API 호출
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('도시 검색 중 오류:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // 검색창 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 도시 선택 핸들러
  const handleSelect = (item) => {
    const adminStr = item.admin1 ? ` (${item.admin1})` : item.country ? ` (${item.country})` : '';
    const displayName = `${item.name}${adminStr}`;

    onSelectCity({
      name: displayName,
      lat: item.latitude,
      lon: item.longitude,
    });

    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
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
          placeholder="전 세계 도시명 검색 (예: Seoul, Busan, Tokyo, Paris...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isSearching && <Loader2 size={18} className="search-status-icon spinning" />}
        {!isSearching && query && (
          <button type="button" className="clear-btn" onClick={handleClear} title="지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((item) => {
                const subLabel = [item.admin1, item.country].filter(Boolean).join(', ');
                return (
                  <li key={`${item.id}-${item.latitude}-${item.longitude}`}>
                    <button
                      type="button"
                      className="search-result-item"
                      onClick={() => handleSelect(item)}
                    >
                      <MapPin size={16} className="item-icon" />
                      <div className="item-text">
                        <span className="item-name">{item.name}</span>
                        {subLabel && <span className="item-sub">{subLabel}</span>}
                      </div>
                      <span className="item-coords">
                        {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.trim().length >= 2 && !isSearching ? (
            <div className="search-empty">
              <span>'{query}'에 일치하는 도시를 찾을 수 없습니다. (영문 도시명 권장)</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

