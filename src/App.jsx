import { useState, useEffect } from 'react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
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
  Droplets,
  Wind,
  Thermometer,
  AlertCircle,
  Loader2,
  RefreshCw,
  MapPin,
  Activity,
  Calendar,
} from 'lucide-react'
import './App.css'

// WMO 날씨 아이콘 매핑 헬퍼
const ICON_MAP = {
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

function WeatherIcon({ name, size = 48, color = 'currentColor' }) {
  const IconComponent = ICON_MAP[name] || Cloud
  return <IconComponent size={size} color={color} />
}

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const handleCitySelect = (city) => {
    if (city.name !== selectedCity.name) {
      setLoading(true)
      setSelectedCity(city)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    // 트리거를 위해 동일 도시 재조회
    loadCityData(selectedCity)
  }

  const loadCityData = async (city) => {
    try {
      setError(null)
      const [weather, airQuality] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])
      setWeatherData(weather)
      setAirQualityData(airQuality)
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (err) {
      console.error('데이터 조회 오류:', err)
      setError('기상 및 미세먼지 정보를 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    async function initFetch() {
      try {
        const [weather, airQuality] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ])
        if (!ignore) {
          setWeatherData(weather)
          setAirQualityData(airQuality)
          setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        }
      } catch (err) {
        if (!ignore) {
          console.error('데이터 조회 오류:', err)
          setError('기상 및 미세먼지 정보를 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    initFetch()
    return () => {
      ignore = true
    }
  }, [selectedCity])

  const currentWeather = weatherData?.current
  const currentAQ = airQualityData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const aqStatus = currentAQ ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5) : null

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 */}
      <header className="app-header">
        <div className="header-title-wrap">
          <h1 className="app-title">🌦️ 실시간 날씨 & 미세먼지</h1>
          <p className="app-subtitle">Open-Meteo 공개 기상 API 연동 실시간 관측소</p>
        </div>
        {lastUpdated && (
          <div className="last-updated">
            <span>최근 업데이트: {lastUpdated}</span>
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="데이터 새로고침"
            >
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
              새로고침
            </button>
          </div>
        )}
      </header>

      {/* 2. 상단 주요 도시 빠른 선택 버튼 */}
      <section className="city-selector-section" aria-label="주요 도시 선택">
        <div className="city-buttons">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                <MapPin size={14} />
                <span>{city.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. 본문 컨텐츠 (로딩 / 에러 / 대시보드 카드) */}
      <main className="dashboard-content">
        {loading && (
          <div className="status-card loading-card">
            <Loader2 size={36} className="spinning" color="#3b82f6" />
            <p className="status-text">{selectedCity.name}의 실시간 데이터를 불러오는 중...</p>
          </div>
        )}

        {!loading && error && (
          <div className="status-card error-card">
            <AlertCircle size={36} color="#ef4444" />
            <p className="status-text error-msg">{error}</p>
            <button className="retry-btn" onClick={handleRefresh}>
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && currentWeather && currentAQ && (
          <div className="cards-grid">
            {/* 현재 날씨 카드 */}
            <article className="card weather-card">
              <div className="card-header">
                <span className="card-badge">현재 날씨</span>
                <span className="location-name">
                  <MapPin size={16} /> {selectedCity.name}
                </span>
              </div>

              <div className="weather-main">
                <div className="weather-icon-wrap" style={{ color: weatherInfo.color }}>
                  <WeatherIcon name={weatherInfo.icon} size={64} color={weatherInfo.color} />
                  <span className="weather-label">{weatherInfo.label}</span>
                </div>
                <div className="weather-temp-wrap">
                  <span className="current-temp">{Math.round(currentWeather.temperature_2m)}°</span>
                  <span className="temp-unit">C</span>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-item">
                  <Thermometer size={18} className="metric-icon" color="#f97316" />
                  <div className="metric-info">
                    <span className="metric-label">체감 온도</span>
                    <span className="metric-val">{Math.round(currentWeather.apparent_temperature)}°C</span>
                  </div>
                </div>
                <div className="metric-item">
                  <Droplets size={18} className="metric-icon" color="#38bdf8" />
                  <div className="metric-info">
                    <span className="metric-label">습도</span>
                    <span className="metric-val">{currentWeather.relative_humidity_2m}%</span>
                  </div>
                </div>
                <div className="metric-item">
                  <Wind size={18} className="metric-icon" color="#64748b" />
                  <div className="metric-info">
                    <span className="metric-label">풍속</span>
                    <span className="metric-val">{currentWeather.wind_speed_10m} km/h</span>
                  </div>
                </div>
                <div className="metric-item">
                  <Calendar size={18} className="metric-icon" color="#8b5cf6" />
                  <div className="metric-info">
                    <span className="metric-label">강수량</span>
                    <span className="metric-val">{currentWeather.precipitation || 0} mm</span>
                  </div>
                </div>
              </div>
            </article>

            {/* 미세먼지 카드 */}
            <article className="card air-card">
              <div className="card-header">
                <span className="card-badge">대기질 지수</span>
                <span
                  className="aqi-status-badge"
                  style={{ backgroundColor: aqStatus.badgeColor, color: '#fff' }}
                >
                  {aqStatus.status}
                </span>
              </div>

              <div className="air-main">
                <div className="air-summary">
                  <Activity size={32} color={aqStatus.badgeColor} />
                  <div>
                    <span className="air-summary-title">통합 대기 상태</span>
                    <strong className="air-summary-status" style={{ color: aqStatus.badgeColor }}>
                      {aqStatus.status}
                    </strong>
                  </div>
                </div>
                {currentAQ.european_aqi !== undefined && (
                  <div className="aqi-score">
                    <span className="aqi-label">유럽 AQI</span>
                    <span className="aqi-value">{Math.round(currentAQ.european_aqi)}</span>
                  </div>
                )}
              </div>

              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-info">
                    <span className="metric-label">미세먼지 (PM10)</span>
                    <span className="metric-val">
                      {Math.round(currentAQ.pm10)} <small>µg/m³</small>
                    </span>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-info">
                    <span className="metric-label">초미세먼지 (PM2.5)</span>
                    <span className="metric-val">
                      {Math.round(currentAQ.pm2_5)} <small>µg/m³</small>
                    </span>
                  </div>
                </div>
              </div>

              <div className="air-guide">
                <span className="guide-title">환경부 미세먼지 등급 기준</span>
                <div className="guide-bar">
                  <span className="bar-step good">좋음</span>
                  <span className="bar-step normal">보통</span>
                  <span className="bar-step bad">나쁨</span>
                  <span className="bar-step very-bad">매우나쁨</span>
                </div>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="app-footer">
        <p>기상 데이터: Open-Meteo (HTTPS) · 환경부 대기질 평가 기준</p>
      </footer>
    </div>
  )
}

export default App
