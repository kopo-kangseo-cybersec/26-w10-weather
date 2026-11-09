import { useState, useEffect } from 'react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import { MapPin, RefreshCw, AlertCircle, History, Trash2, Sparkles } from 'lucide-react'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

// 날씨 상태와 낮/밤에 따른 동적 비주얼 테마 계산 (옵션 A)
function getWeatherThemeClass(current) {
  if (!current) return 'theme-default'
  const { is_day, weather_code } = current

  if (is_day === 0) {
    return 'theme-night'
  }
  // 비 / 소나기 / 뇌우
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weather_code)) {
    return 'theme-rainy'
  }
  // 눈
  if ([71, 73, 75, 77].includes(weather_code)) {
    return 'theme-snowy'
  }
  // 흐림 / 안개
  if ([2, 3, 45, 48].includes(weather_code)) {
    return 'theme-cloudy'
  }
  // 맑음
  return 'theme-sunny'
}

const RECENT_CITIES_STORAGE_KEY = 'weather_recent_cities_v1'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_CITIES_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 최근 조회한 도시 목록 로컬 스토리지에 동기화 (옵션 B)
  const addToRecentCities = (city) => {
    setRecentCities((prev) => {
      const filtered = prev.filter(
        (c) => c.name !== city.name && (c.lat !== city.lat || c.lon !== city.lon)
      )
      const updated = [city, ...filtered].slice(0, 5)
      try {
        localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.warn('localStorage 저장 실패:', e)
      }
      return updated
    })
  }

  const clearRecentCities = () => {
    setRecentCities([])
    try {
      localStorage.removeItem(RECENT_CITIES_STORAGE_KEY)
    } catch (e) {
      console.warn('localStorage 삭제 실패:', e)
    }
  }

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
      addToRecentCities(city)
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
  const themeClass = getWeatherThemeClass(currentWeather)

  return (
    <div className={`weather-dashboard ${themeClass}`}>
      {/* 대시보드 헤더 */}
      <header className="dashboard-header">
        <div className="header-title">
          <div className="title-with-theme">
            <h1>실시간 날씨 & 미세먼지 대시보드</h1>
            <span className="theme-indicator" title="현재 날씨 기반 동적 테마 활성화">
              <Sparkles size={14} />
              동적 테마
            </span>
          </div>
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

      {/* 옵션 B: 최근 조회한 도시 바 */}
      {recentCities.length > 0 && (
        <section className="recent-cities-section" aria-label="최근 본 도시">
          <div className="recent-header">
            <span className="recent-title">
              <History size={13} />
              최근 본 도시
            </span>
            <button
              type="button"
              className="clear-recent-btn"
              onClick={clearRecentCities}
              title="최근 목록 지우기"
            >
              <Trash2 size={12} />
              비우기
            </button>
          </div>
          <div className="recent-cities-list">
            {recentCities.map((city) => (
              <button
                key={`recent-${city.name}-${city.lat}-${city.lon}`}
                type="button"
                className={`recent-pill ${selectedCity.name === city.name ? 'active' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 주요 도시 빠른 선택 버튼 목록 */}
      <nav className="city-preset-bar" aria-label="주요 거점 도시 선택">
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

