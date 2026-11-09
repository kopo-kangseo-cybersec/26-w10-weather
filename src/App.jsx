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
import './App.css'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 날씨 및 미세먼지 데이터 비동기 병렬 조회
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

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 */}
      <header className="app-header">
        <div className="brand">
          <span className="brand-badge">LIVE WEATHER DASHBOARD</span>
          <h1>실시간 기상 대시보드</h1>
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

      {/* 2. 도시 검색 입력창 (400ms 디바운스 적용) */}
      <section className="search-section" aria-label="도시 검색">
        <CitySearch onSelectCity={(city) => setSelectedCity(city)} />
      </section>

      {/* 3. 주요 도시 빠른 선택 프리셋 버튼 바 */}
      <section className="city-selector-section" aria-label="도시 빠른 선택">
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

      {/* 4. 본문 컨텐츠 (로딩 / 에러 / 대시보드 카드들) */}
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
              <CurrentWeather city={selectedCity} weather={weather} />
              <AirQualityCard airQuality={airQuality} />
            </div>

            {/* 24시간 기온 SVG 꺾은선 차트 */}
            <HourlyChart weather={weather} />

            {/* 7일간 주간 일기예보 */}
            <WeeklyForecast weather={weather} />
          </div>
        )}
      </main>

      {/* 5. 푸터 안내 */}
      <footer className="app-footer">
        <p>
          기상 및 대기질 데이터: <strong>Open-Meteo Public API</strong> (HTTPS 통신 / 400ms 디바운스 검색 탑재)
        </p>
      </footer>
    </div>
  )
}
