import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
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

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="weather-app">
      {/* 상단 헤더 */}
      <header className="app-header">
        <div className="header-title">
          <h1>실시간 날씨 & 대시보드</h1>
          <p className="subtitle">Open-Meteo API 기반 국내외 도시 기상·미세먼지 실시간 모니터링</p>
        </div>

        {/* 4. 실시간 도시 검색창 (400ms 디바운스 적용) */}
        <CitySearch onSelectCity={setSelectedCity} />
      </header>

      {/* 1. 주요 도시 빠른 선택 버튼 바 */}
      <CitySelector
        cities={DEFAULT_CITIES}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
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
  )
}
