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
import { RefreshCw, AlertCircle, MapPin, Sparkles } from 'lucide-react';
import './App.css';

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airData, setAirData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

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

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 */}
      <header className="header-section">
        <div className="title-area">
          <div className="brand-badge">
            <Sparkles size={16} /> Open-Meteo 실시간 연동
          </div>
          <h1>기상 및 미세먼지 대시보드</h1>
          <p className="subtitle">국내 주요 도시 및 전 세계 도시의 실시간 기상 상태와 7일 예보를 확인하세요</p>
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

      {/* 2. 도시 검색 & 빠른 선택 바 */}
      <section className="search-and-nav-section">
        <CitySearch
          onSelectCity={(city) => setSelectedCity(city)}
          currentCityName={selectedCity.name}
        />

        <nav className="city-nav" aria-label="도시 빠른 선택">
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
          {/* 상단 1열: 현재 날씨 & 미세먼지 */}
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
          기상 및 대기질 데이터 출처: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo API</a> (비영리 오픈 기상 프로젝트)
        </p>
      </footer>
    </div>
  );
}

export default App;
