import { useState, useEffect, useCallback } from 'react';
import {
  CloudSun,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
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

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <CloudSun size={34} color="#2563eb" />
          실시간 날씨 · 미세먼지 대시보드
        </h1>
        <p className="dashboard-subtitle">
          Open-Meteo 실시간 기상 · 대기질 · 24시간 및 주간 예보 통합 대시보드
        </p>
      </header>

      {/* 도시 검색 입력창 (400ms Debounce 적용) */}
      <CitySearch onSelectCity={setSelectedCity} />

      {/* 주요 도시 빠른 선택 버튼 */}
      <nav className="city-selector" aria-label="주요 도시 선택">
        {DEFAULT_CITIES.map((city) => {
          const isActive =
            selectedCity.name === city.name &&
            Math.abs(selectedCity.lat - city.lat) < 0.01;
          return (
            <button
              key={city.name}
              type="button"
              className={`city-btn ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCity(city)}
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
