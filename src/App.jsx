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
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  RefreshCw,
  AlertCircle,
  Activity,
} from 'lucide-react'
import './App.css'

  // 날씨 코드에 매핑되는 Lucide 아이콘 컴포넌트 매퍼
  const ICON_COMPONENTS = {
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

  function WeatherIcon({ iconName, size = 48, color }) {
    const IconComponent = ICON_COMPONENTS[iconName] || Cloud
    return <IconComponent size={size} color={color} />
  }

  export default function App() {
    const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
    const [weatherData, setWeatherData] = useState(null)
    const [airQualityData, setAirQualityData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)

    useEffect(() => {
      let ignore = false

      Promise.all([
        fetchWeatherData(selectedCity.lat, selectedCity.lon),
        fetchAirQualityData(selectedCity.lat, selectedCity.lon),
      ])
        .then(([weather, airQuality]) => {
          if (!ignore) {
            setWeatherData(weather)
            setAirQualityData(airQuality)
            setLastUpdated(new Date())
            setError(null)
            setLoading(false)
          }
        })
        .catch((err) => {
          console.error(err)
          if (!ignore) {
            setError('기상 및 미세먼지 데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.')
            setLoading(false)
          }
        })

      return () => {
        ignore = true
      }
    }, [selectedCity])

    const handleCitySelect = (city) => {
      if (city.name !== selectedCity.name) {
        setSelectedCity(city)
        setLoading(true)
        setError(null)
      }
    }

    const handleRefresh = () => {
      setLoading(true)
      setError(null)
      Promise.all([
        fetchWeatherData(selectedCity.lat, selectedCity.lon),
        fetchAirQualityData(selectedCity.lat, selectedCity.lon),
      ])
        .then(([weather, airQuality]) => {
          setWeatherData(weather)
          setAirQualityData(airQuality)
          setLastUpdated(new Date())
        })
        .catch((err) => {
          console.error(err)
          setError('기상 및 미세먼지 데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.')
        })
        .finally(() => {
          setLoading(false)
        })
    }

    const currentWeather = weatherData?.current
    const currentAQ = airQualityData?.current
    const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
    const aqStatus = currentAQ ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5) : null

    return (
            <div className="weather-dashboard">
              {/* 헤더 */}
              <header className="dashboard-header">
                <div className="header-title">
                  <h1>실시간 날씨 & 미세먼지</h1>
                  <p className="subtitle">Open-Meteo API 기반 전국 기상 대시보드</p>
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
                      onClick={handleRefresh}
                      disabled={loading}
                      title="새로고침"
                    >
                      <RefreshCw size={16} className={loading ? 'spin' : ''} />
                      <span>새로고침</span>
                    </button>
                  </div>
              </header>

              {/* 주요 도시 빠른 선택 버튼 목록 */}
              <nav className="city-preset-bar" aria-label="주요 도시 선택">
                {DEFAULT_CITIES.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    className={`city-pill ${selectedCity.name === city.name ? 'active' : ''}`}
                    onClick={() => handleCitySelect(city)}
                  >
                    <MapPin size={14} />
                    <span>{city.name}</span>
                  </button>
                ))}
              </nav>

                  {/* 에러 메시지 배너 */}
                  {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" onClick={handleRefresh}>
            다시 시도
          </button>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && !weatherData && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{selectedCity.name}의 기상 정보를 불러오는 중입니다...</p>
        </div>
                  )}

                {/* 대시보드 메인 카드 그리드 */}
                {currentWeather && currentAQ && (
                  <main className={`cards-grid ${loading ? 'updating' : ''}`}>
                    {/* 현재 날씨 카드 */}
                    <section className="card weather-card">
                      <div className="card-header">
                        <span className="card-badge">현재 날씨</span>
                        <span className="location-name">
                          <MapPin size={16} />
                          {selectedCity.name}
                        </span>
                      </div>

                      <div className="weather-main-info">
                        <div className="icon-wrapper">
                          <WeatherIcon
                            iconName={weatherInfo?.icon}
                            size={64}
                            color={weatherInfo?.color || '#3b82f6'}
                          />
                          <span className="weather-desc" style={{ color: weatherInfo?.color }}>
                            {weatherInfo?.label}
                          </span>
                        </div>
                        <div className="temp-display">
                          <span className="temperature">
                            {Math.round(currentWeather.temperature_2m)}
                          </span>
                          <span className="unit">°C</span>
                        </div>
                      </div>

                      <div className="weather-details-grid">
                        <div className="detail-item">
                          <Thermometer size={18} className="detail-icon" />
                          <div className="detail-text">
                            <span className="label">체감 온도</span>
                            <span className="value">
                              {Math.round(currentWeather.apparent_temperature)}°C
                            </span>
                          </div>
                        </div>

                        <div className="detail-item">
                          <Droplets size={18} className="detail-icon" />
                          <div className="detail-text">
                            <span className="label">상대 습도</span>
                            <span className="value">{currentWeather.relative_humidity_2m}%</span>
                          </div>
                        </div>

                        <div className="detail-item">
                          <Wind size={18} className="detail-icon" />
                          <div className="detail-text">
                            <span className="label">풍속</span>
                            <span className="value">{currentWeather.wind_speed_10m} m/s</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* 미세먼지 카드 */}
                    <section className="card air-quality-card">
                      <div className="card-header">
                        <span className="card-badge">공기질 (환경부 기준)</span>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: aqStatus?.badgeColor,
                            color: '#ffffff',
                          }}
                        >
                          {aqStatus?.status}
                        </span>
                      </div>

                      <div className="aqi-main-status">
                        <Activity size={32} style={{ color: aqStatus?.badgeColor }} />
                        <div className="aqi-overview">
                          <h3>통합 대기질 상태: <strong>{aqStatus?.status}</strong></h3>
                          <p>실외 활동 시 환경부 대기질 지표를 참고하세요.</p>
                        </div>
                      </div>

                      <div className="aqi-metrics-grid">
                        {/* PM10 미세먼지 */}
                        <div className="aqi-metric-box">
                          <div className="metric-header">
                            <span className="metric-name">미세먼지 (PM10)</span>
                            <span className="metric-value">
                              {Math.round(currentAQ.pm10)} <small>μg/m³</small>
                            </span>
                          </div>
                          <div className="progress-bar-bg">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${Math.min(100, (currentAQ.pm10 / 150) * 100)}%`,
                                backgroundColor:
                                  currentAQ.pm10 > 150
                                    ? '#ef4444'
                                    : currentAQ.pm10 > 80
                                      ? '#f97316'
                                      : currentAQ.pm10 > 30
                                        ? '#3b82f6'
                                        : '#10b981',
                              }}
                            ></div>
                          </div>
                          <div className="range-guide">
                            <span>좋음 0~30</span>
                            <span>보통 ~80</span>
                            <span>나쁨 ~150</span>
                            <span>매우나쁨 151+</span>
                          </div>
                        </div>

                        {/* PM2.5 초미세먼지 */}
                        <div className="aqi-metric-box">
                          <div className="metric-header">
                            <span className="metric-name">초미세먼지 (PM2.5)</span>
                            <span className="metric-value">
                              {Math.round(currentAQ.pm2_5)} <small>μg/m³</small>
                            </span>
                          </div>
                          <div className="progress-bar-bg">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${Math.min(100, (currentAQ.pm2_5 / 75) * 100)}%`,
                                backgroundColor:
                                  currentAQ.pm2_5 > 75
                                    ? '#ef4444'
                                    : currentAQ.pm2_5 > 35
                                      ? '#f97316'
                                      : currentAQ.pm2_5 > 15
                                        ? '#3b82f6'
                                        : '#10b981',
                              }}
                            ></div>
                          </div>
                          <div className="range-guide">
                            <span>좋음 0~15</span>
                            <span>보통 ~35</span>
                            <span>나쁨 ~75</span>
                            <span>매우나쁨 76+</span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </main>
                )}

                {/* 푸터 */}
                <footer className="dashboard-footer">
                  <p>실시간 기상 및 대기질 데이터 출처: <strong>Open-Meteo.com</strong> (Non-commercial Public API)</p>
                </footer>
            </div>
            )
}
