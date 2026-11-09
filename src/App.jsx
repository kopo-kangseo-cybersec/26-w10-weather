import { useState, useEffect, useCallback } from 'react'
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
  Thermometer,
  Droplets,
  Wind,
  Activity,
  RefreshCw,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import './App.css'

// WMO 날씨 코드별 Lucide 아이콘 매핑
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

function WeatherIcon({ name, size = 48, color = 'currentColor', className = '' }) {
  const IconComp = ICON_MAP[name] || Cloud
  return <IconComp size={size} color={color} className={className} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 날씨 및 미세먼지 데이터 비동기 조회
  const loadCityData = useCallback(async (city) => {
    setLoading(true)
    setError(null)

    try {
      const [weatherRes, airQualityRes] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])

      setWeather(weatherRes)
      setAirQuality(airQualityRes)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('기상 데이터 불러오기 오류:', err)
      setError('기상 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 도시 선택 변경 시 데이터 갱신
  useEffect(() => {
    loadCityData(selectedCity)
  }, [selectedCity, loadCityData])

  // 현재 날씨 정보 파싱
  const currentWeather = weather?.current
  const weatherMeta = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null

  // 미세먼지 정보 파싱
  const currentAir = airQuality?.current
  const pm10Value = currentAir?.pm10 ?? null
  const pm25Value = currentAir?.pm2_5 ?? null
  const airStatus = (pm10Value !== null && pm25Value !== null)
    ? getAirQualityStatus(pm10Value, pm25Value)
    : null

  // 개별 PM 등급 계산
  const getPm10Grade = (val) => {
    if (val === null || val === undefined) return { label: '-', color: '#94a3b8' }
    if (val <= 30) return { label: '좋음', color: '#10b981' }
    if (val <= 80) return { label: '보통', color: '#3b82f6' }
    if (val <= 150) return { label: '나쁨', color: '#f97316' }
    return { label: '매우 나쁨', color: '#ef4444' }
  }

  const getPm25Grade = (val) => {
    if (val === null || val === undefined) return { label: '-', color: '#94a3b8' }
    if (val <= 15) return { label: '좋음', color: '#10b981' }
    if (val <= 35) return { label: '보통', color: '#3b82f6' }
    if (val <= 75) return { label: '나쁨', color: '#f97316' }
    return { label: '매우 나쁨', color: '#ef4444' }
  }

  const pm10Grade = getPm10Grade(pm10Value)
  const pm25Grade = getPm25Grade(pm25Value)

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 */}
      <header className="app-header">
        <div className="brand">
          <span className="brand-badge">LIVE WEATHER</span>
          <h1>실시간 날씨 & 미세먼지</h1>
        </div>
        <div className="header-meta">
          {lastUpdated && (
            <span className="last-updated">
              업데이트: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            className="refresh-btn"
            onClick={() => loadCityData(selectedCity)}
            disabled={loading}
            title="새로고침"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            새로고침
          </button>
        </div>
      </header>

      {/* 2. 주요 도시 빠른 선택 버튼 바 */}
      <section className="city-selector-section" aria-label="도시 빠른 선택">
        <div className="city-selector-label">
          <MapPin size={16} />
          <span>주요 도시 선택</span>
        </div>
        <div className="city-btn-group">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
                aria-pressed={isSelected}
              >
                {city.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. 본문 컨텐츠 (로딩 / 에러 / 데이터 카드) */}
      <main className="dashboard-content">
        {loading && (
          <div className="state-panel loading-panel">
            <div className="spinner"></div>
            <p><strong>{selectedCity.name}</strong> 기상 및 공기질 데이터를 불러오는 중...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-panel error-panel">
            <AlertCircle size={40} className="error-icon" />
            <h3>데이터 조회 실패</h3>
            <p>{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadCityData(selectedCity)}
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && currentWeather && (
          <div className="cards-grid">
            {/* 현재 날씨 카드 */}
            <article className="card weather-card">
              <div className="card-header">
                <div>
                  <span className="card-tag">현재 기상</span>
                  <h2 className="city-title">{selectedCity.name}</h2>
                </div>
                {weatherMeta && (
                  <div
                    className="weather-badge"
                    style={{ backgroundColor: `${weatherMeta.color}20`, color: weatherMeta.color }}
                  >
                    <WeatherIcon name={weatherMeta.icon} size={20} color={weatherMeta.color} />
                    <span>{weatherMeta.label}</span>
                  </div>
                )}
              </div>

              <div className="weather-main-row">
                <div className="weather-icon-large">
                  <WeatherIcon
                    name={weatherMeta?.icon}
                    size={72}
                    color={weatherMeta?.color || '#3b82f6'}
                  />
                </div>
                <div className="temperature-group">
                  <span className="temp-value">
                    {Math.round(currentWeather.temperature_2m)}
                    <span className="temp-unit">°C</span>
                  </span>
                  <span className="temp-sub">
                    체감 {Math.round(currentWeather.apparent_temperature)}°C
                  </span>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">
                    <Thermometer size={16} />
                    <span>체감온도</span>
                  </div>
                  <strong className="metric-value">
                    {Math.round(currentWeather.apparent_temperature)}°C
                  </strong>
                </div>

                <div className="metric-item">
                  <div className="metric-label">
                    <Droplets size={16} />
                    <span>상대습도</span>
                  </div>
                  <strong className="metric-value">
                    {currentWeather.relative_humidity_2m}%
                  </strong>
                </div>

                <div className="metric-item">
                  <div className="metric-label">
                    <Wind size={16} />
                    <span>풍속</span>
                  </div>
                  <strong className="metric-value">
                    {currentWeather.wind_speed_10m} <small>km/h</small>
                  </strong>
                </div>
              </div>
            </article>

            {/* 미세먼지 카드 */}
            <article className="card air-card">
              <div className="card-header">
                <div>
                  <span className="card-tag">대기질 지수</span>
                  <h2 className="city-title">환경부 기준 대기질</h2>
                </div>
                {airStatus && (
                  <div
                    className="air-status-badge"
                    style={{ backgroundColor: airStatus.badgeColor }}
                  >
                    <Activity size={16} />
                    <span>{airStatus.status}</span>
                  </div>
                )}
              </div>

              <div className="air-summary">
                <div className="air-overall">
                  <span className="air-label">통합 대기질 상태</span>
                  <strong
                    className="air-grade-text"
                    style={{ color: airStatus?.badgeColor || 'inherit' }}
                  >
                    {airStatus ? airStatus.status : '측정 정보 없음'}
                  </strong>
                </div>
              </div>

              <div className="air-pollutants-list">
                {/* PM10 */}
                <div className="pollutant-box">
                  <div className="pollutant-top">
                    <div>
                      <span className="pollutant-name">미세먼지 (PM10)</span>
                      <span className="pollutant-standard">기준: 0~30 좋음 / 31~80 보통</span>
                    </div>
                    <span
                      className="grade-chip"
                      style={{
                        backgroundColor: `${pm10Grade.color}20`,
                        color: pm10Grade.color,
                        borderColor: pm10Grade.color,
                      }}
                    >
                      {pm10Grade.label}
                    </span>
                  </div>
                  <div className="pollutant-val">
                    <strong>{pm10Value !== null ? Math.round(pm10Value) : '-'}</strong>
                    <span className="unit">μg/m³</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, ((pm10Value || 0) / 150) * 100)}%`,
                        backgroundColor: pm10Grade.color,
                      }}
                    ></div>
                  </div>
                </div>

                {/* PM2.5 */}
                <div className="pollutant-box">
                  <div className="pollutant-top">
                    <div>
                      <span className="pollutant-name">초미세먼지 (PM2.5)</span>
                      <span className="pollutant-standard">기준: 0~15 좋음 / 16~35 보통</span>
                    </div>
                    <span
                      className="grade-chip"
                      style={{
                        backgroundColor: `${pm25Grade.color}20`,
                        color: pm25Grade.color,
                        borderColor: pm25Grade.color,
                      }}
                    >
                      {pm25Grade.label}
                    </span>
                  </div>
                  <div className="pollutant-val">
                    <strong>{pm25Value !== null ? Math.round(pm25Value) : '-'}</strong>
                    <span className="unit">μg/m³</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, ((pm25Value || 0) / 75) * 100)}%`,
                        backgroundColor: pm25Grade.color,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* 푸터 안내 */}
      <footer className="app-footer">
        <p>기상 데이터 제공: <strong>Open-Meteo Public API</strong> (HTTPS 통신 / API Key 불필요)</p>
      </footer>
    </div>
  )
}
