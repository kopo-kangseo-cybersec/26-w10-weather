import { useState, useEffect } from 'react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

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
    if (city.lat !== selectedCity.lat || city.lon !== selectedCity.lon) {
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
      {/* 대시보드 헤더 */}
      <header className="dashboard-header">
        <div className="header-title">
          <h1>실시간 날씨 & 미세먼지 대시보드</h1>
          <p className="subtitle">Open-Meteo API 기반 국내외 기상 및 대기질 실시간 정보</p>
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

      {/* 도시 검색창 (400ms 디바운스 적용) */}
      <section className="search-section">
        <CitySearch onSelectCity={handleCitySelect} />
      </section>

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

      {/* 초기 로딩 표시 */}
      {loading && !weatherData && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{selectedCity.name}의 기상 정보를 불러오는 중입니다...</p>
        </div>
      )}

      {/* 대시보드 콘텐츠 영역 */}
      {currentWeather && currentAQ && (
        <main className={`dashboard-content ${loading ? 'updating' : ''}`}>
          {/* 상단 2열 그리드: 현재 날씨 + 미세먼지 */}
          <div className="cards-grid">
            <CurrentWeather
              city={selectedCity}
              current={currentWeather}
              weatherInfo={weatherInfo}
            />
            <AirQualityCard
              currentAQ={currentAQ}
              aqStatus={aqStatus}
            />
          </div>

          {/* 24시간 시간별 기온 SVG 차트 */}
          {weatherData.hourly && (
            <HourlyChart hourly={weatherData.hourly} referenceDate={lastUpdated} />
          )}

          {/* 7일간 주간 예보 */}
          {weatherData.daily && (
            <WeeklyForecast daily={weatherData.daily} />
          )}
        </main>
      )}

      {/* 푸터 */}
      <footer className="dashboard-footer">
        <p>실시간 기상 및 대기질 데이터 출처: <strong>Open-Meteo.com</strong> (Non-commercial Public API)</p>
      </footer>
    </div>
  )
}
