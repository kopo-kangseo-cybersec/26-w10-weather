import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { searchCities } from '../api/weather';

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 🛡️ 사이버보안 체크포인트: 디바운스(Debounce 400ms) 적용
  // 연속 타이핑 시 불필요한 API 요청을 차단하여 서버 부하 및 429 Too Many Requests 방지
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
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

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const formattedName = `${item.name}${item.admin1 ? ', ' + item.admin1 : ''} (${item.country || 'KR'})`;
    onSelectCity({
      name: formattedName,
      lat: item.latitude,
      lon: item.longitude,
    });
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="city-search-wrapper" ref={containerRef}>
      <div className="search-input-group">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="도시 이름 검색 (예: Seoul, Busan, Tokyo, London)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {isSearching && <Loader2 className="spinner-icon animate-spin" size={18} />}
        {query && !isSearching && (
          <button type="button" className="clear-btn" onClick={handleClear} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="search-security-badge" title="400ms 디바운스로 API 남용(DoS) 방지">
        <ShieldCheck size={13} />
        <span>400ms 디바운스 보호</span>
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={`${item.id}-${item.latitude}-${item.longitude}`}
                type="button"
                className="search-item"
                onClick={() => handleSelect(item)}
              >
                <MapPin size={16} className="item-icon" />
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta">
                    {item.admin1 && `${item.admin1}, `}
                    {item.country} ({item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°)
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="no-result">검색 결과가 없습니다 (영문 도시명 권장)</div>
          )}
        </div>
      )}
    </div>
  );
}
