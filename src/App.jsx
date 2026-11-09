import { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  RefreshCw,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import CitySearch from './components/CitySearch';
import RecentCities from './components/RecentCities';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyChart from './components/HourlyChart';
import WeeklyForecast from './components/WeeklyForecast';
import './App.css';

// 날씨 코드 및 낮/밤(is_day) 기반 동적 배경 테마 클래스 산출
function getWeatherThemeClass(weatherCode, isDay = 1) {
  if (weatherCode === undefined || weatherCode === null) return 'weather-theme-default';

  // 눈 (71, 73, 75, 77)
  if ([71, 73, 75, 77].includes(weatherCode)) return 'weather-theme-snowy';

  // 뇌우 (95)
  if (weatherCode === 95) return 'weather-theme-thunder';

  // 비 / 소나기 / 이슬비
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    return isDay ? 'weather-theme-rainy-day' : 'weather-theme-rainy-night';
  }

  // 안개 (45, 48)
  if ([45, 48].includes(weatherCode)) return 'weather-theme-foggy';

  // 구름 / 흐림 (2, 3)
  if ([2, 3].includes(weatherCode)) {
    return isDay ? 'weather-theme-cloudy-day' : 'weather-theme-cloudy-night';
  }

  // 맑음 / 대체로 맑음 (0, 1)
  return isDay ? 'weather-theme-clear-day' : 'weather-theme-clear-night';
}

export default function App() {
  // 1. 라이트/다크 모드 상태 (기본값: light)
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem('weather_dashboard_mode') || 'light';
    } catch {
      return 'light';
    }
  });

  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 최근 본 도시 (localStorage 연동, 초기값 지연 로딩)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem('weather_recent_cities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // HTML 루트 요소에 data-theme 속성 동기화
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    try {
      localStorage.setItem('weather_dashboard_mode', themeMode);
    } catch (e) {
      console.warn('localStorage 저장 실패:', e);
    }
  }, [themeMode]);

  // 테마 모드 토글
  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 날씨 및 미세먼지 데이터 동시 조회 (도시 변경 또는 새로고침 트리거 시)
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [weather, air] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ]);

        if (!ignore) {
          setWeatherData(weather);
          setAirData(air);
          setLastUpdated(
            new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      } catch (err) {
        console.error('데이터 조회 오류:', err);
        if (!ignore) {
          setError('기상 및 미세먼지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [selectedCity, refreshTrigger]);

  // 도시 선택 핸들러 (프리셋 또는 검색 결과)
  const handleCitySelect = (city) => {
    if (city.lat === selectedCity.lat && city.lon === selectedCity.lon) {
      setRefreshTrigger((prev) => prev + 1);
      return;
    }

    setSelectedCity(city);

    // 최근 본 도시 목록에 추가 (중복 방지, 최대 5개)
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== city.name);
      const updated = [city, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('weather_recent_cities', JSON.stringify(updated));
      } catch (e) {
        console.warn('localStorage 저장 실패:', e);
      }
      return updated;
    });
  };

  // 최근 본 도시 개별 삭제
  const handleRemoveRecentCity = (cityName) => {
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName);
      try {
        localStorage.setItem('weather_recent_cities', JSON.stringify(updated));
      } catch (e) {
        console.warn('localStorage 삭제 실패:', e);
      }
      return updated;
    });
  };

  // 최근 본 도시 전체 삭제
  const handleClearAllRecent = () => {
    setRecentCities([]);
    try {
      localStorage.removeItem('weather_recent_cities');
    } catch (e) {
      console.warn('localStorage 전체 삭제 실패:', e);
    }
  };

  // 현재 날씨 코드 및 낮/밤 기반 테마 클래스 산출
  const currentWeather = weatherData?.current;
  const weatherThemeClass = getWeatherThemeClass(
    currentWeather?.weather_code,
    currentWeather?.is_day ?? 1
  );

  return (
    <div className={`weather-app-shell ${weatherThemeClass} theme-${themeMode}`}>
      {/* 배경 장식 오버레이 (날씨 분위기 연출 레이어) */}
      <div className="weather-bg-overlay" aria-hidden="true" />

      <div className="weather-dashboard">
        {/* 1. 상단 헤더 */}
        <header className="dashboard-header">
          <div className="brand">
            <div className="brand-icon">
              <Sun className="brand-sun" size={26} />
            </div>
            <div>
              <h1>실시간 기상 대시보드</h1>
              <p className="subtitle">Open-Meteo API 기반 실시간 날씨·미세먼지·예보</p>
            </div>
          </div>

          <div className="header-actions">
            {lastUpdated && (
              <span className="last-updated">마지막 업데이트: {lastUpdated}</span>
            )}

            {/* 라이트/다크 모드 토글 스위치 버튼 */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleThemeMode}
              title={themeMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              aria-label="테마 모드 전환"
            >
              {themeMode === 'light' ? (
                <>
                  <Moon size={16} className="theme-icon moon" />
                  <span>다크 모드</span>
                </>
              ) : (
                <>
                  <Sun size={16} className="theme-icon sun" />
                  <span>라이트 모드</span>
                </>
              )}
            </button>

            {/* 새로고침 버튼 */}
            <button
              type="button"
              className="refresh-btn"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              disabled={loading}
              title="기상 데이터 새로고침"
            >
              <RefreshCw size={15} className={loading ? 'spinning' : ''} />
              <span>새로고침</span>
            </button>
          </div>
        </header>

        {/* 2. 검색창, 최근 본 도시, 주요 도시 빠른 선택 바 */}
        <section className="search-and-presets-section">
          <CitySearch onSelectCity={handleCitySelect} />

          {/* 최근 본 도시 뱃지 바 (옵션 B) */}
          <RecentCities
            recentCities={recentCities}
            currentCity={selectedCity}
            onSelectCity={handleCitySelect}
            onRemoveCity={handleRemoveRecentCity}
            onClearAll={handleClearAllRecent}
          />

          <nav className="city-quick-selector" aria-label="주요 도시 선택">
            <div className="selector-label">
              <MapPin size={15} />
              <span>주요 도시 빠른 선택</span>
            </div>
            <div className="city-btn-group">
              {DEFAULT_CITIES.map((city) => {
                const isSelected =
                  city.lat === selectedCity.lat && city.lon === selectedCity.lon;
                return (
                  <button
                    key={city.name}
                    type="button"
                    className={`city-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleCitySelect(city)}
                    disabled={loading && isSelected}
                  >
                    {city.name}
                  </button>
                );
              })}
            </div>
          </nav>
        </section>

        {/* 3. 메인 대시보드 콘텐츠 */}
        <main className="dashboard-main">
          {loading && !weatherData && !error && (
            <div className="status-container loading-container">
              <div className="spinner"></div>
              <p className="status-text">{selectedCity.name} 기상 정보를 불러오는 중입니다...</p>
            </div>
          )}

          {error && (
            <div className="status-container error-container">
              <AlertCircle size={44} className="error-icon" />
              <h3 className="error-title">데이터 로드 실패</h3>
              <p className="status-text">{error}</p>
              <button
                type="button"
                className="retry-btn"
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
              >
                다시 시도
              </button>
            </div>
          )}

          {!error && weatherData && airData && (
            <div className={`dashboard-sections ${loading ? 'updating' : ''}`}>
              {/* 1행: 현재 날씨 + 미세먼지 카드 (2열 그리드) */}
              <div className="cards-grid">
                <CurrentWeather
                  city={selectedCity}
                  currentWeather={weatherData.current}
                />
                <AirQualityCard currentAir={airData.current} />
              </div>

              {/* 2행: 24시간 기온 SVG 차트 (전폭 와이드) */}
              <HourlyChart hourlyData={weatherData.hourly} />

              {/* 3행: 7일간 주간 예보 (전폭 와이드) */}
              <WeeklyForecast dailyData={weatherData.daily} />
            </div>
          )}
        </main>

        {/* 4. 푸터 */}
        <footer className="dashboard-footer">
          <p>
            기상 및 대기질 데이터 출처: <strong>Open-Meteo Public API</strong> (비영리 오픈 기상 프로젝트)
          </p>
        </footer>
      </div>
    </div>
  );
}
