import { useState, useEffect, useCallback } from 'react';
import {
  CloudSun,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
  History,
  X,
  Palette,
} from 'lucide-react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import CitySearch from './components/CitySearch';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyChart from './components/HourlyChart';
import WeeklyForecast from './components/WeeklyForecast';
import './App.css';

const RECENT_CITIES_KEY = 'weather_recent_cities';
const MAX_RECENT_CITIES = 6;

/**
 * 옵션 A: 현재 날씨 코드 및 낮/밤(is_day)에 따른 동적 테마 정보 반환
 */
function getWeatherTheme(current) {
  if (!current) {
    return { className: 'theme-sunny', label: '기본 하늘 테마' };
  }

  const isDay = current.is_day === 1;
  const code = current.weather_code;

  if (!isDay) {
    return { className: 'theme-night', label: '고요한 밤하늘 테마' };
  }
  if (code >= 71 && code <= 77) {
    return { className: 'theme-snowy', label: '포근한 눈꽃 테마' };
  }
  if ((code >= 51 && code <= 67) || code >= 80) {
    return { className: 'theme-rainy', label: '촉촉한 빗소리 테마' };
  }
  if (code >= 2 && code <= 48) {
    return { className: 'theme-cloudy', label: '차분한 구름 테마' };
  }
  return { className: 'theme-sunny', label: '화창한 햇살 테마' };
}

function loadSavedRecentCities() {
  try {
    const raw = localStorage.getItem(RECENT_CITIES_KEY);
    if (!raw) return [DEFAULT_CITIES[0]];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('최근 본 도시 로드 실패:', err);
  }
  return [DEFAULT_CITIES[0]];
}

function isSameCity(a, b) {
  return (
    a.name === b.name ||
    (Math.abs(a.lat - b.lat) < 0.01 && Math.abs(a.lon - b.lon) < 0.01)
  );
}

function App() {
  const [recentCities, setRecentCities] = useState(loadSavedRecentCities);
  const [selectedCity, setSelectedCity] = useState(
    () => loadSavedRecentCities()[0] || DEFAULT_CITIES[0]
  );
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 옵션 B: 도시 선택 시 localStorage에 최근 본 도시 저장
  const handleSelectCity = useCallback((city) => {
    setSelectedCity(city);
    setRecentCities((prev) => {
      const filtered = prev.filter((item) => !isSameCity(item, city));
      const updated = [city, ...filtered].slice(0, MAX_RECENT_CITIES);
      try {
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('최근 본 도시 저장 실패:', err);
      }
      return updated;
    });
  }, []);

  const handleRemoveRecentCity = (e, cityToRemove) => {
    e.stopPropagation();
    setRecentCities((prev) => {
      const updated = prev.filter((item) => !isSameCity(item, cityToRemove));
      try {
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('최근 본 도시 삭제 실패:', err);
      }
      return updated;
    });
  };

  const handleClearRecentCities = () => {
    setRecentCities([]);
    try {
      localStorage.removeItem(RECENT_CITIES_KEY);
    } catch (err) {
      console.error('최근 본 도시 초기화 실패:', err);
    }
  };

  const loadCityWeather = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    try {
      const [weather, airQuality] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ]);
      setWeatherData(weather);
      setAirQualityData(airQuality);
    } catch (err) {
      setError(
        err.message || '기상 및 미세먼지 데이터를 불러오는 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCityWeather(selectedCity);
  }, [selectedCity, loadCityWeather]);

  // 옵션 A: 날씨 상태 및 낮/밤에 따라 body 배경 테마 클래스 동기화
  const themeInfo = getWeatherTheme(weatherData?.current);
  useEffect(() => {
    document.body.className = themeInfo.className;
  }, [themeInfo.className]);

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-top-row">
          <span className="theme-indicator-badge">
            <Palette size={14} />
            {themeInfo.label}
          </span>
        </div>
        <h1 className="dashboard-title">
          <CloudSun size={34} color="#2563eb" />
          실시간 날씨 · 미세먼지 대시보드
        </h1>
        <p className="dashboard-subtitle">
          Open-Meteo 실시간 기상 · 대기질 · 24시간 및 주간 예보 통합 대시보드
        </p>
      </header>

      {/* 도시 검색 입력창 (400ms Debounce 적용) */}
      <CitySearch onSelectCity={handleSelectCity} />

      {/* 옵션 B: 최근 본 도시 (localStorage 저장 및 원클릭 뱃지) */}
      {recentCities.length > 0 && (
        <section className="recent-cities-bar" aria-label="최근 본 도시">
          <div className="recent-cities-header">
            <span className="recent-cities-label">
              <History size={15} />
              최근 본 도시
            </span>
            <button
              type="button"
              className="recent-clear-all-btn"
              onClick={handleClearRecentCities}
            >
              기록 지우기
            </button>
          </div>
          <div className="recent-cities-list">
            {recentCities.map((city) => {
              const isActive = isSameCity(selectedCity, city);
              return (
                <div
                  key={`${city.name}-${city.lat}-${city.lon}`}
                  className={`recent-city-badge ${isActive ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="recent-city-select-btn"
                    onClick={() => handleSelectCity(city)}
                  >
                    {city.name}
                  </button>
                  <button
                    type="button"
                    className="recent-city-remove-btn"
                    onClick={(e) => handleRemoveRecentCity(e, city)}
                    aria-label={`${city.name} 최근 목록에서 삭제`}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 주요 도시 빠른 선택 버튼 */}
      <nav className="city-selector" aria-label="주요 도시 선택">
        {DEFAULT_CITIES.map((city) => {
          const isActive = isSameCity(selectedCity, city);
          return (
            <button
              key={city.name}
              type="button"
              className={`city-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectCity(city)}
            >
              <MapPin size={15} />
              {city.name}
            </button>
          );
        })}
      </nav>

      {/* 로딩 및 에러 안내 */}
      {loading ? (
        <section className="status-card" aria-live="polite">
          <Loader2 size={42} className="spinner" />
          <p className="status-message">
            {selectedCity.name}의 실시간 날씨와 예보 정보를 불러오는 중입니다...
          </p>
        </section>
      ) : error ? (
        <section className="status-card error-card" role="alert">
          <AlertCircle size={44} color="#dc2626" />
          <h2 className="error-title">데이터를 불러오지 못했습니다</h2>
          <p className="error-desc">{error}</p>
          <button
            type="button"
            className="retry-btn"
            onClick={() => loadCityWeather(selectedCity)}
          >
            <RefreshCw size={16} />
            다시 시도
          </button>
        </section>
      ) : (
        weatherData && (
          <div className="dashboard-content">
            <section className="cards-grid">
              <CurrentWeather
                cityName={selectedCity.name}
                current={weatherData.current}
              />
              <AirQualityCard airQualityData={airQualityData} />
            </section>

            <HourlyChart
              hourly={weatherData.hourly}
              currentTime={weatherData.current?.time}
            />

            <WeeklyForecast daily={weatherData.daily} />
          </div>
        )
      )}
    </main>
  );
}

export default App;
