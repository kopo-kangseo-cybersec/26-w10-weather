import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import { RefreshCw, AlertCircle, MapPin } from 'lucide-react'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import CitySearch from './components/CitySearch'
import RecentCities from './components/RecentCities'
import './App.css'

const STORAGE_KEY = 'weather_recent_cities_v1'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [tempUnit, setTempUnit] = useState('C') // 'C' or 'F'

  // 최근 조회한 도시 목록 (localStorage)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 최근 본 도시 추가
  const addRecentCity = useCallback((city) => {
    setRecentCities((prev) => {
      const filtered = prev.filter(
        (c) => !(c.name === city.name && Math.abs(c.lat - city.lat) < 0.01)
      )
      const updated = [city, ...filtered].slice(0, 5) // 최대 5개 유지
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('localStorage 저장 실패:', e)
      }
      return updated
    })
  }, [])

  // 최근 본 도시 개별 삭제
  const removeRecentCity = useCallback((cityToRemove) => {
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityToRemove.name)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('localStorage 저장 실패:', e)
      }
      return updated
    })
  }, [])

  // 최근 본 도시 전체 비우기
  const clearRecentCities = useCallback(() => {
    setRecentCities([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('localStorage 삭제 실패:', e)
    }
  }, [])

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
      addRecentCity(city)
    } catch (err) {
      console.error('기상 데이터 불러오기 오류:', err)
      setError('기상 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [addRecentCity])

  // 도시 선택 변경 시 데이터 갱신
  useEffect(() => {
    loadCityData(selectedCity)
  }, [selectedCity, loadCityData])

  // 동적 날씨 비주얼 테마 계산 (옵션 A)
  const getThemeClass = () => {
    if (!weather?.current) return 'theme-clear'
    const isDay = weather.current.is_day === 1
    const code = weather.current.weather_code

    if (!isDay) return 'theme-night'
    if ([71, 73, 75, 77].includes(code)) return 'theme-snow'
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) return 'theme-rain'
    if ([3, 45, 48].includes(code)) return 'theme-cloudy'
    return 'theme-clear'
  }

  const themeClass = getThemeClass()

  return (
    <div className={`weather-app-wrapper ${themeClass}`}>
      <div className="weather-app">
        {/* 1. 상단 헤더 */}
        <header className="app-header">
          <div className="brand">
            <span className="brand-badge">LIVE WEATHER DASHBOARD</span>
            <h1>실시간 스마트 기상 대시보드</h1>
          </div>

          <div className="header-meta">
            {/* 섭씨/화씨 토글 스위치 (옵션 D) */}
            <div className="unit-toggle" role="group" aria-label="온도 단위 선택">
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'C' ? 'active' : ''}`}
                onClick={() => setTempUnit('C')}
              >
                °C
              </button>
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'F' ? 'active' : ''}`}
                onClick={() => setTempUnit('F')}
              >
                °F
              </button>
            </div>

            {lastUpdated && (
              <span className="last-updated">
                업데이트: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            <button
              type="button"
              className="refresh-btn"
              onClick={() => loadCityData(selectedCity)}
              disabled={loading}
              title="새로고침"
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              새로고침
            </button>
          </div>
        </header>

        {/* 2. 도시 검색창 (400ms 디바운스 적용) */}
        <section className="search-section" aria-label="도시 검색">
          <CitySearch onSelectCity={(city) => setSelectedCity(city)} />
        </section>

        {/* 3. 최근 조회한 도시 (옵션 B: localStorage 연동) */}
        <RecentCities
          cities={recentCities}
          onSelectCity={(city) => setSelectedCity(city)}
          onRemoveCity={removeRecentCity}
          onClearAll={clearRecentCities}
        />

        {/* 4. 주요 도시 빠른 선택 프리셋 버튼 바 */}
        <section className="city-selector-section" aria-label="주요 도시 프리셋">
          <div className="city-selector-label">
            <MapPin size={16} />
            <span>주요 도시 프리셋</span>
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

        {/* 5. 본문 컨텐츠 (로딩 / 에러 / 대시보드 카드들) */}
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

          {!loading && !error && weather && airQuality && (
            <div className="dashboard-flow">
              {/* 상단 2열 그리드: 현재 날씨 + 환경부 대기질 지수 */}
              <div className="cards-grid">
                <CurrentWeather
                  city={selectedCity}
                  weather={weather}
                  tempUnit={tempUnit}
                />
                <AirQualityCard airQuality={airQuality} />
              </div>

              {/* 오늘 24시간 기온 SVG 차트 */}
              <HourlyChart weather={weather} tempUnit={tempUnit} />

              {/* 향후 7일간 주간 일기예보 */}
              <WeeklyForecast weather={weather} tempUnit={tempUnit} />
            </div>
          )}
        </main>

        {/* 6. 푸터 안내 */}
        <footer className="app-footer">
          <p>
            기상 데이터: <strong>Open-Meteo Public API</strong> (HTTPS 통신 / 400ms 디바운스 / 단위 변환 & 동적 테마 연동)
          </p>
        </footer>
      </div>
    </div>
  )
}
