import { useState, useEffect } from 'react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyChart from './components/HourlyChart';
import WeeklyForecast from './components/WeeklyForecast';
import CitySearch from './components/CitySearch';
import { RefreshCw, AlertCircle, MapPin, Sparkles, History, X } from 'lucide-react';
import './App.css';

const RECENT_CITIES_KEY = 'weather_recent_cities';

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airData, setAirData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // 옵션 B: 최근 본 도시 상태 (localStorage 연동)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_CITIES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 날씨 및 미세먼지 정보 병렬 조회
  const loadCityData = async (city) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [weather, air] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ]);
      setWeatherData(weather);
      setAirData(air);
      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      // 옵션 B: 최근 조회 도시 저장 (최대 5개, 중복 제거)
      setRecentCities((prev) => {
        const filtered = prev.filter((c) => c.name !== city.name);
        const updated = [city, ...filtered].slice(0, 5);
        try {
          localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err) {
      console.error('데이터 조회 오류:', err);
      setErrorMessage(
        err.message || '기상 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCityData(selectedCity);
  }, [selectedCity]);

  // 옵션 B: 최근 본 도시 삭제 핸들러
  const handleRemoveRecentCity = (e, cityName) => {
    e.stopPropagation();
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName);
      try {
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // 옵션 A: 날씨 상태 및 낮/밤 기반 동적 테마 결정
  const getThemeClass = () => {
    if (!weatherData?.current) return 'theme-default';
    const { weather_code, is_day } = weatherData.current;

    // 비/소나기/뇌우
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weather_code)) {
      return is_day === 0 ? 'theme-rain-night' : 'theme-rain';
    }
    // 눈/싸락눈
    if ([71, 73, 75, 77].includes(weather_code)) {
      return is_day === 0 ? 'theme-snow-night' : 'theme-snow';
    }
    // 흐림/안개
    if ([2, 3, 45, 48].includes(weather_code)) {
      return is_day === 0 ? 'theme-cloudy-night' : 'theme-cloudy';
    }
    // 맑음/대체로 맑음
    return is_day === 0 ? 'theme-clear-night' : 'theme-clear-day';
  };

  const themeClass = getThemeClass();

  return (
    <div className={`weather-app-wrapper ${themeClass}`}>
      <div className="weather-app">
        {/* 1. 상단 헤더 */}
        <header className="header-section">
          <div className="title-area">
            <div className="brand-badge">
              <Sparkles size={16} /> Open-Meteo 실시간 연동
            </div>
            <h1>기상 및 미세먼지 대시보드</h1>
            <p className="subtitle">
              국내 주요 도시 및 전 세계 도시의 실시간 기상 상태와 7일 예보를 확인하세요
            </p>
          </div>
          <div className="header-meta">
            {lastUpdated && <span className="last-updated">업데이트: {lastUpdated}</span>}
            <button
              type="button"
              className="refresh-btn"
              onClick={() => loadCityData(selectedCity)}
              disabled={isLoading}
              title="새로고침"
            >
              <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
              <span>새로고침</span>
            </button>
          </div>
        </header>

        {/* 2. 도시 검색 & 프리셋 / 최근 본 도시 바 */}
        <section className="search-and-nav-section">
          <CitySearch
            onSelectCity={(city) => setSelectedCity(city)}
            currentCityName={selectedCity.name}
          />

          {/* 옵션 B: 최근 본 도시 목록 */}
          {recentCities.length > 0 && (
            <div className="recent-cities-bar">
              <div className="recent-title">
                <History size={15} /> 최근 본 도시
              </div>
              <div className="recent-buttons-wrapper">
                {recentCities.map((city) => {
                  const isSelected = city.name === selectedCity.name;
                  return (
                    <button
                      key={city.name}
                      type="button"
                      className={`recent-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedCity(city)}
                    >
                      <span className="recent-name">{city.name}</span>
                      <span
                        className="recent-close-btn"
                        onClick={(e) => handleRemoveRecentCity(e, city.name)}
                        title="삭제"
                      >
                        <X size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 주요 도시 프리셋 바 */}
          <nav className="city-nav" aria-label="주요 도시 빠른 선택">
            <div className="city-nav-title">
              <MapPin size={16} /> 주요 도시 프리셋
            </div>
            <div className="city-buttons-wrapper">
              {DEFAULT_CITIES.map((city) => {
                const isSelected = city.name === selectedCity.name;
                return (
                  <button
                    key={city.name}
                    type="button"
                    className={`city-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedCity(city)}
                    disabled={isLoading && isSelected}
                  >
                    {city.name}
                  </button>
                );
              })}
            </div>
          </nav>
        </section>

        {/* 3. 에러 안내 배너 */}
        {errorMessage && (
          <div className="error-banner">
            <AlertCircle size={22} color="#ef4444" />
            <div className="error-text">
              <strong>데이터 로드 실패</strong>
              <p>{errorMessage}</p>
            </div>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadCityData(selectedCity)}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 4. 초기 로딩 표시 */}
        {isLoading && !weatherData && (
          <div className="loading-card">
            <RefreshCw size={36} className="spinning text-primary" />
            <p>{selectedCity.name} 기상 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {/* 5. 완성형 메인 대시보드 그리드 */}
        {weatherData && (
          <main className={`dashboard-grid ${isLoading ? 'is-refreshing' : ''}`}>
            {/* 상단: 현재 날씨 & 미세먼지 */}
            <div className="grid-row-primary">
              <CurrentWeather city={selectedCity} weatherData={weatherData} />
              <AirQualityCard airData={airData} />
            </div>

            {/* 24시간 시간별 기온 변화 SVG 꺾은선 차트 */}
            <div className="grid-row-full">
              <HourlyChart weatherData={weatherData} />
            </div>

            {/* 향후 7일간 주간 예보 */}
            <div className="grid-row-full">
              <WeeklyForecast weatherData={weatherData} />
            </div>
          </main>
        )}

        {/* 푸터 */}
        <footer className="footer-section">
          <p>
            기상 및 대기질 데이터 출처:{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
              Open-Meteo API
            </a>{' '}
            (비영리 오픈 기상 프로젝트)
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
