import { useState, useEffect } from 'react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import CitySearch from './components/CitySearch'
import { MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import './App.css'

// 💡 6단계 커스터마이징: 날씨 상태 및 낮/밤(is_day) 기반 동적 비주얼 테마 산출
function getThemeInfo(currentWeather) {
  if (!currentWeather) {
    return {
      themeClass: 'theme-default',
      badgeText: '🌤️ 기본 테마',
    }
  }

  const isDay = currentWeather.is_day === 1
  const code = currentWeather.weather_code

  if (!isDay) {
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) {
      return {
        themeClass: 'theme-night-rain',
        badgeText: '🌧️ 밤 · 비 감성 테마',
      }
    }
    return {
      themeClass: 'theme-night',
      badgeText: '🌙 밤 · 차분한 밤하늘 테마',
    }
  }

  // 낮 테마
  if ([0, 1].includes(code)) {
    return {
      themeClass: 'theme-sunny',
      badgeText: '☀️ 낮 · 화창한 햇살 테마',
    }
  }
  if ([2, 3, 45, 48].includes(code)) {
    return {
      themeClass: 'theme-cloudy',
      badgeText: '☁️ 낮 · 은은한 구름 테마',
    }
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) {
    return {
      themeClass: 'theme-rainy',
      badgeText: '🌧️ 낮 · 촉촉한 비 테마',
    }
  }
  if ([71, 73, 75, 77].includes(code)) {
    return {
      themeClass: 'theme-snowy',
      badgeText: '❄️ 낮 · 맑은 눈 테마',
    }
  }

  return {
    themeClass: 'theme-sunny',
    badgeText: '🌤️ 주간 테마',
  }
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
      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
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
          setLastUpdated(
            new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          )
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
  const themeInfo = getThemeInfo(currentWeather)

  return (
    <div className={`weather-app-wrapper ${themeInfo.themeClass}`}>
      <div className="weather-app">
        {/* 1. 상단 헤더 */}
        <header className="app-header">
          <div className="header-title-wrap">
            <div className="title-row">
              <h1 className="app-title">🌦️ 실시간 날씨 & 미세먼지 대시보드</h1>
              <span className="theme-indicator-badge">{themeInfo.badgeText}</span>
            </div>
            <p className="app-subtitle">Open-Meteo 공개 기상 API 연동 글로벌 관측소</p>
          </div>
          {lastUpdated && (
            <div className="last-updated">
              <span>최근 업데이트: {lastUpdated}</span>
              <button
                type="button"
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

        {/* 2. 글로벌 도시 검색 바 (400ms 디바운스 적용) */}
        <section className="search-section" aria-label="도시 검색">
          <CitySearch onSelectCity={handleCitySelect} />
        </section>

        {/* 3. 국내 주요 도시 빠른 선택 버튼 */}
        <section className="city-selector-section" aria-label="주요 도시 퀵 선택">
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

        {/* 4. 대시보드 메인 영역 */}
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
              <button type="button" className="retry-btn" onClick={handleRefresh}>
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && currentWeather && currentAQ && (
            <div className="dashboard-grid">
              {/* 상단 2열: 현재 날씨 + 미세먼지 */}
              <div className="cards-grid">
                <CurrentWeather
                  currentWeather={currentWeather}
                  weatherInfo={weatherInfo}
                  cityName={selectedCity.name}
                />
                <AirQualityCard currentAQ={currentAQ} aqStatus={aqStatus} />
              </div>

              {/* 24시간 시간별 기온 변화 SVG 차트 */}
              {weatherData?.hourly && (
                <HourlyChart
                  hourly={weatherData.hourly}
                  currentTime={currentWeather?.time}
                />
              )}

              {/* 7일간 주간 일기예보 */}
              {weatherData?.daily && <WeeklyForecast daily={weatherData.daily} />}
            </div>
          )}
        </main>

        {/* 푸터 */}
        <footer className="app-footer">
          <p>
            기상 데이터: Open-Meteo (HTTPS) · 한국 환경부 대기질 평가 기준 · 400ms 검색 디바운싱 적용 · 동적 날씨 테마 엔진
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
