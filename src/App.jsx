import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle, History, X } from 'lucide-react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import CitySelector from './components/CitySelector'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

const RECENT_STORAGE_KEY = 'weather_recent_cities'

// 날씨 상태 및 주야간(is_day) 기반 동적 비주얼 테마 클래스 계산
function getDynamicThemeClass(weather) {
  if (!weather?.current) return 'theme-default'

  const { weather_code, is_day } = weather.current

  // 비 / 소나기 (codes: 51, 53, 55, 61, 63, 65, 80, 81, 82)
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather_code)) {
    return 'theme-rainy'
  }
  // 눈 / 싸락눈 / 폭설 (codes: 71, 73, 75, 77)
  if ([71, 73, 75, 77].includes(weather_code)) {
    return 'theme-snowy'
  }
  // 뇌우 (code: 95)
  if (weather_code === 95) {
    return 'theme-stormy'
  }
  // 안개 (codes: 45, 48)
  if ([45, 48].includes(weather_code)) {
    return 'theme-foggy'
  }
  // 흐림 (code: 3)
  if (weather_code === 3) {
    return is_day === 0 ? 'theme-cloudy-night' : 'theme-cloudy'
  }

  // 맑음 / 구름 조금 (codes: 0, 1, 2)
  if (is_day === 0) {
    return 'theme-clear-night'
  }
  return 'theme-sunny-day'
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 옵션 B: 최근 본 도시 목록 (localStorage)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 도시 선택 및 최근 본 도시 업데이트
  const handleSelectCity = useCallback((city) => {
    setSelectedCity(city)

    setRecentCities((prev) => {
      // 중복 제거 후 맨 앞에 추가 (최대 5개 유지)
      const filtered = prev.filter((item) => item.name !== city.name)
      const updated = [city, ...filtered].slice(0, 5)
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('최근 도시 저장 실패:', err)
      }
      return updated
    })
  }, [])

  // 최근 도시 항목 삭제
  const handleRemoveRecentCity = (e, cityName) => {
    e.stopPropagation()
    setRecentCities((prev) => {
      const updated = prev.filter((item) => item.name !== cityName)
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('최근 도시 삭제 실패:', err)
      }
      return updated
    })
  }

  // 선택된 도시의 날씨 및 미세먼지 정보 로드
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
      console.error('기상 데이터 로딩 오류:', err)
      setError('기상 정보를 불러오는 데 실패했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCityData(selectedCity)
  }, [selectedCity, loadCityData])

  // 옵션 A: 날씨 및 낮/밤 기반 동적 테마 클래스
  const themeClass = getDynamicThemeClass(weather)

  return (
    <div className={`weather-app-wrapper ${themeClass}`}>
      <div className="weather-app">
        {/* 상단 헤더 */}
        <header className="app-header">
          <div className="header-title">
            <h1>실시간 날씨 & 대시보드</h1>
            <p className="subtitle">
              Open-Meteo API 기반 국내외 도시 기상·미세먼지 실시간 모니터링
            </p>
          </div>

          {/* 도시 검색창 (400ms 디바운스 적용) */}
          <CitySearch onSelectCity={handleSelectCity} />
        </header>

        {/* 옵션 B: 최근 본 도시 뱃지 바 */}
        {recentCities.length > 0 && (
          <section className="recent-cities-section" aria-label="최근 본 도시">
            <div className="recent-header">
              <History size={14} className="recent-icon" />
              <span className="recent-label">최근 본 도시:</span>
            </div>
            <div className="recent-chips-list">
              {recentCities.map((city) => (
                <div
                  key={city.name}
                  className={`recent-chip ${selectedCity.name === city.name ? 'active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="chip-name">{city.name}</span>
                  <button
                    type="button"
                    className="chip-remove-btn"
                    onClick={(e) => handleRemoveRecentCity(e, city.name)}
                    aria-label={`${city.name} 삭제`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 1. 주요 도시 빠른 선택 버튼 바 */}
        <CitySelector
          cities={DEFAULT_CITIES}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          disabled={isLoading}
        />

        {/* 메인 콘텐츠 영역 (로딩, 에러, 대시보드 카드들) */}
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

          {!isLoading && !error && weather && airQuality && (
            <div className="dashboard-layout">
              {/* 상단 그리드: 현재 날씨 & 미세먼지 카드 */}
              <div className="top-cards-grid">
                <CurrentWeather city={selectedCity} weather={weather} />
                <AirQualityCard city={selectedCity} airQuality={airQuality} />
              </div>

              {/* 중단: 24시간 시간별 기온 SVG 꺾은선 차트 */}
              <HourlyChart weather={weather} />

              {/* 하단: 7일간 주간 예보 */}
              <WeeklyForecast weather={weather} />
            </div>
          )}
        </main>

        {/* 하단 푸터 */}
        <footer className="app-footer">
          <p>Data provided by Open-Meteo API • 한국 환경부 대기질 기준</p>
        </footer>
      </div>
    </div>
  )
}
