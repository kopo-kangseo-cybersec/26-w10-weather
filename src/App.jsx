import { useState, useEffect, useCallback } from 'react'
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
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather'
import './App.css'

// lucide-react 날씨 아이콘 동적 매핑 컴포넌트
function WeatherIcon({ iconName, size = 48, color = 'currentColor' }) {
  const iconMap = {
    Sun,
    SunDim,
    CloudSun,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    Snowflake,
    CloudLightning,
  }
  const IconComponent = iconMap[iconName] || Cloud
  return <IconComponent size={size} color={color} strokeWidth={2} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 선택된 도시의 날씨 및 미세먼지 데이터 패칭
  const loadCityData = useCallback(async (city) => {
    setIsLoading(true)
    setError(null)

    try {
      const [weatherRes, airRes] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])

      setWeather(weatherRes)
      setAirQuality(airRes)
    } catch (err) {
      console.error('기상 데이터 조회 오류:', err)
      setError('기상 정보를 불러오는 데 실패했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCityData(selectedCity)
  }, [selectedCity, loadCityData])

  const currentWeather = weather?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const currentAir = airQuality?.current
  const airStatus = currentAir
    ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5)
    : null

  return (
    <div className="weather-app">
      {/* 상단 헤더 */}
      <header className="app-header">
        <div className="header-title">
          <h1>실시간 날씨 & 미세먼지</h1>
          <p className="subtitle">Open-Meteo API 기반 국내 주요 도시 실시간 기상 예보</p>
        </div>
      </header>

      {/* 1. 주요 도시 빠른 선택 버튼 바 */}
      <section className="city-selector-section" aria-label="도시 선택">
        <div className="city-button-list">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
                disabled={isLoading && isSelected}
              >
                <MapPin size={15} />
                <span>{city.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 메인 콘텐츠 영역 (로딩, 에러, 날씨/미세먼지 카드) */}
      <main className="main-content">
        {isLoading && (
          <div className="status-box loading-box">
            <RefreshCw className="spin-icon" size={36} />
            <p><strong>{selectedCity.name}</strong> 기상 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="status-box error-box">
            <AlertCircle size={40} className="error-icon" />
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadCityData(selectedCity)}
            >
              <RefreshCw size={16} /> 다시 시도
            </button>
          </div>
        )}

        {!isLoading && !error && currentWeather && currentAir && (
          <div className="dashboard-grid">
            {/* 2. 선택된 도시의 현재 날씨 카드 */}
            <article className="card weather-card">
              <div className="card-header">
                <span className="card-tag">현재 날씨</span>
                <span className="location-name">{selectedCity.name}</span>
              </div>

              <div className="weather-main-info">
                <div
                  className="weather-icon-wrapper"
                  style={{ backgroundColor: `${weatherInfo?.color}15` }}
                >
                  <WeatherIcon
                    iconName={weatherInfo?.icon}
                    size={64}
                    color={weatherInfo?.color}
                  />
                </div>
                <div className="temp-wrapper">
                  <div className="current-temp">
                    {Math.round(currentWeather.temperature_2m)}
                    <span className="temp-unit">°C</span>
                  </div>
                  <div
                    className="weather-status-label"
                    style={{ color: weatherInfo?.color }}
                  >
                    {weatherInfo?.label}
                  </div>
                </div>
              </div>

              <div className="weather-details-grid">
                <div className="detail-item">
                  <Thermometer size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">체감 온도</span>
                    <span className="detail-value">
                      {Math.round(currentWeather.apparent_temperature)}°C
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <Droplets size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">습도</span>
                    <span className="detail-value">{currentWeather.relative_humidity_2m}%</span>
                  </div>
                </div>

                <div className="detail-item">
                  <Wind size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">풍속</span>
                    <span className="detail-value">{currentWeather.wind_speed_10m} km/h</span>
                  </div>
                </div>
              </div>
            </article>

            {/* 3. 선택된 도시의 미세먼지 카드 */}
            <article className="card air-quality-card">
              <div className="card-header">
                <span className="card-tag">대기질 지표</span>
                {airStatus && (
                  <span
                    className="air-status-badge"
                    style={{ backgroundColor: airStatus.badgeColor }}
                  >
                    {airStatus.status}
                  </span>
                )}
              </div>

              <div className="air-summary-box">
                <p className="air-guide-text">
                  한국 환경부 기준에 따른 <strong>{selectedCity.name}</strong> 대기 상태입니다.
                </p>
              </div>

              <div className="air-metrics-grid">
                {/* 미세먼지 (PM10) */}
                <div className="metric-box">
                  <div className="metric-header">
                    <span className="metric-title">미세먼지 (PM10)</span>
                    <span className="metric-grade">
                      {currentAir.pm10 <= 30
                        ? '좋음'
                        : currentAir.pm10 <= 80
                        ? '보통'
                        : currentAir.pm10 <= 150
                        ? '나쁨'
                        : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="metric-value-row">
                    <span className="metric-number">{Math.round(currentAir.pm10)}</span>
                    <span className="metric-unit">µg/m³</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${Math.min((currentAir.pm10 / 160) * 100, 100)}%`,
                        backgroundColor:
                          currentAir.pm10 <= 30
                            ? '#10b981'
                            : currentAir.pm10 <= 80
                            ? '#3b82f6'
                            : currentAir.pm10 <= 150
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    />
                  </div>
                </div>

                {/* 초미세먼지 (PM2.5) */}
                <div className="metric-box">
                  <div className="metric-header">
                    <span className="metric-title">초미세먼지 (PM2.5)</span>
                    <span className="metric-grade">
                      {currentAir.pm2_5 <= 15
                        ? '좋음'
                        : currentAir.pm2_5 <= 35
                        ? '보통'
                        : currentAir.pm2_5 <= 75
                        ? '나쁨'
                        : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="metric-value-row">
                    <span className="metric-number">{Math.round(currentAir.pm2_5)}</span>
                    <span className="metric-unit">µg/m³</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${Math.min((currentAir.pm2_5 / 80) * 100, 100)}%`,
                        backgroundColor:
                          currentAir.pm2_5 <= 15
                            ? '#10b981'
                            : currentAir.pm2_5 <= 35
                            ? '#3b82f6'
                            : currentAir.pm2_5 <= 75
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="app-footer">
        <p>Data provided by Open-Meteo API • 한국 환경부 대기질 기준</p>
      </footer>
    </div>
  )
}
