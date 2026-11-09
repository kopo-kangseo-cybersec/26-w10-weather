import { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather';
import './App.css';

const WEATHER_ICONS = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
};

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

  const current = weatherData?.current;
  const weatherInfo = current ? getWeatherInfo(current.weather_code) : null;
  const WeatherIcon = weatherInfo
    ? WEATHER_ICONS[weatherInfo.icon] || Cloud
    : Cloud;

  const pm10 = airQualityData?.current?.pm10 ?? 0;
  const pm25 = airQualityData?.current?.pm2_5 ?? 0;
  const aqStatus = getAirQualityStatus(pm10, pm25);

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <CloudSun size={34} color="#2563eb" />
          실시간 날씨 · 미세먼지 대시보드
        </h1>
        <p className="dashboard-subtitle">
          Open-Meteo 실시간 기상 및 대기질 데이터를 확인하세요
        </p>
      </header>

      {/* 주요 도시 빠른 선택 버튼 */}
      <nav className="city-selector" aria-label="주요 도시 선택">
        {DEFAULT_CITIES.map((city) => {
          const isActive = selectedCity.name === city.name;
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
            {selectedCity.name}의 실시간 날씨와 미세먼지 정보를 불러오는 중입니다...
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
        current && (
          <section className="cards-grid">
            {/* 현재 날씨 카드 */}
            <article className="info-card">
              <div className="card-header">
                <div className="card-title-group">
                  <span className="card-label">Current Weather</span>
                  <h2 className="card-city-name">
                    <MapPin size={20} color="#2563eb" />
                    {selectedCity.name} 현재 날씨
                  </h2>
                </div>
              </div>

              <div className="weather-main">
                <div className="temperature-display">
                  <span className="temp-value">
                    {Math.round(current.temperature_2m)}°C
                  </span>
                  <span
                    className="weather-status-label"
                    style={{ color: weatherInfo.color }}
                  >
                    {weatherInfo.label}
                  </span>
                </div>
                <div className="weather-icon-wrapper">
                  <WeatherIcon size={54} color={weatherInfo.color} />
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">
                    <Thermometer size={14} /> 체감온도
                  </span>
                  <span className="metric-value">
                    {Math.round(current.apparent_temperature)}°C
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">
                    <Droplets size={14} /> 습도
                  </span>
                  <span className="metric-value">
                    {current.relative_humidity_2m}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">
                    <Wind size={14} /> 풍속
                  </span>
                  <span className="metric-value">
                    {current.wind_speed_10m} km/h
                  </span>
                </div>
              </div>
            </article>

            {/* 미세먼지 카드 */}
            <article className="info-card">
              <div className="card-header">
                <div className="card-title-group">
                  <span className="card-label">Air Quality</span>
                  <h2 className="card-city-name">대기질 · 미세먼지</h2>
                </div>
                <span
                  className="aq-badge"
                  style={{ backgroundColor: aqStatus.badgeColor }}
                >
                  {aqStatus.status}
                </span>
              </div>

              <div className="aq-list">
                <div className="aq-box">
                  <span className="aq-box-title">미세먼지 (PM10)</span>
                  <div className="aq-box-value">
                    {Math.round(pm10)}
                    <span className="aq-unit">μg/m³</span>
                  </div>
                </div>
                <div className="aq-box">
                  <span className="aq-box-title">초미세먼지 (PM2.5)</span>
                  <div className="aq-box-value">
                    {Math.round(pm25)}
                    <span className="aq-unit">μg/m³</span>
                  </div>
                </div>
              </div>

              <p className="aq-guide">
                환경부 기준 등급 판정: 좋음(PM10 ≤ 30 / PM2.5 ≤ 15) · 보통(≤ 80 / ≤ 35) · 나쁨(≤ 150 / ≤ 75) · 매우 나쁨(151+ / 76+)
              </p>
            </article>
          </section>
        )
      )}
    </main>
  );
}

export default App;
