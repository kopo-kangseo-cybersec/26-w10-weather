import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle, History, X, Monitor } from 'lucide-react'
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

// 옵션 A: MS-DOS / 레트로 터미널 동적 비주얼 테마
function getRetroThemeClass(weather) {
  if (!weather?.current) return 'retro-theme-win31'

  const { weather_code, is_day } = weather.current

  // 비 / 눈 / 뇌우: 앰버(Amber) CRT 터미널
  if ([51, 53, 55, 61, 63, 65, 71, 73, 75, 77, 80, 81, 82, 95].includes(weather_code)) {
    return 'retro-theme-amber'
  }
  // 밤: 클래식 매트릭스/도스 그린 CRT 터미널
  if (is_day === 0) {
    return 'retro-theme-green'
  }
  // 맑은 낮: 클래식 Windows 3.1 Teal 데스크톱
  return 'retro-theme-win31'
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 옵션 D: 섭씨(°C)와 화씨(°F) 단위 변환 토글
  const [unit, setUnit] = useState('C')

  const convertTemp = useCallback(
    (celsius) => {
      if (unit === 'F') {
        return Math.round((celsius * 9) / 5 + 32)
      }
      return Math.round(celsius)
    },
    [unit]
  )

  // 옵션 B: 최근 본 도시 목록 (localStorage)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const handleSelectCity = useCallback((city) => {
    setSelectedCity(city)

    setRecentCities((prev) => {
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

  const themeClass = getRetroThemeClass(weather)

  return (
    <div className={`retro-desktop-wrapper ${themeClass}`}>
      <div className="retro-app-container">
        {/* 상단 Windows 3.1 메인 창 프레임 */}
        <header className="retro-main-window retro-window">
          <div className="retro-titlebar">
            <div className="titlebar-left">
              <Monitor size={16} className="titlebar-icon" />
              <span className="title-text">MS-DOS Weather System v3.11</span>
            </div>
            <div className="titlebar-controls">
              <span className="win-btn">▲</span>
              <span className="win-btn">▼</span>
            </div>
          </div>

          {/* 레트로 메뉴 바 및 단위 변환 토글 (옵션 D) */}
          <div className="retro-menubar">
            <span className="menu-item"><u>F</u>ile</span>
            <span className="menu-item"><u>E</u>dit</span>
            <span className="menu-item"><u>V</u>iew</span>
            <span className="menu-item"><u>H</u>elp</span>
            
            {/* 옵션 D: 단위 변환 토글 버튼 */}
            <div className="menu-unit-toggle">
              <span className="toggle-label">[UNIT]:</span>
              <button
                type="button"
                className={`unit-toggle-btn ${unit === 'C' ? 'active' : ''}`}
                onClick={() => setUnit('C')}
              >
                °C
              </button>
              <button
                type="button"
                className={`unit-toggle-btn ${unit === 'F' ? 'active' : ''}`}
                onClick={() => setUnit('F')}
              >
                °F
              </button>
            </div>
          </div>

          <div className="retro-header-body">
            <h1 className="retro-cli-title">C:\WEATHER&gt; METEO_DASHBOARD.EXE</h1>
            <p className="retro-cli-sub">&gt;&gt; Open-Meteo Realtime Telemetry Station (Terminal Mode)</p>
          </div>

          {/* 도시 검색 입력창 */}
          <div className="retro-search-wrap">
            <CitySearch onSelectCity={handleSelectCity} />
          </div>
        </header>

        {/* 옵션 B: 최근 본 도시 뱃지 바 */}
        {recentCities.length > 0 && (
          <section className="recent-cities-section retro-window" aria-label="최근 본 도시">
            <div className="retro-titlebar">
              <span className="title-text">RECENT_CITIES.LOG</span>
            </div>
            <div className="recent-chips-list retro-content">
              <div className="recent-header">
                <History size={16} className="recent-icon" />
                <span className="recent-label">&gt; RECENT:</span>
              </div>
              {recentCities.map((city) => (
                <div
                  key={city.name}
                  className={`recent-chip retro-chip ${selectedCity.name === city.name ? 'active' : ''}`}
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
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 주요 도시 선택 바 */}
        <CitySelector
          cities={DEFAULT_CITIES}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          disabled={isLoading}
        />

        {/* 메인 콘텐츠 영역 (로딩, 에러, 대시보드 카드들) */}
        <main className="main-content">
          {isLoading && (
            <div className="status-box retro-window loading-box">
              <RefreshCw className="spin-icon" size={16} />
              <p>&gt; [LOADING] DATA ACQUISITION IN PROGRESS FOR <strong>{selectedCity.name}</strong>...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="status-box retro-window error-box">
              <AlertCircle size={16} className="error-icon" />
              <p className="error-message">&gt; [SYSTEM ERROR] {error}</p>
              <button
                type="button"
                className="retry-btn retro-btn"
                onClick={() => loadCityData(selectedCity)}
              >
                <RefreshCw size={16} /> RETRY.BAT
              </button>
            </div>
          )}

          {!isLoading && !error && weather && airQuality && (
            <div className="dashboard-layout">
              {/* 상단 2열 그리드: 현재 날씨 & 미세먼지 카드 */}
              <div className="top-cards-grid">
                <CurrentWeather
                  city={selectedCity}
                  weather={weather}
                  unit={unit}
                  convertTemp={convertTemp}
                />
                <AirQualityCard city={selectedCity} airQuality={airQuality} />
              </div>

              {/* 중단: 24시간 시간별 기온 SVG 꺾은선 차트 */}
              <HourlyChart
                weather={weather}
                unit={unit}
                convertTemp={convertTemp}
              />

              {/* 하단: 7일간 주간 예보 */}
              <WeeklyForecast
                weather={weather}
                unit={unit}
                convertTemp={convertTemp}
              />
            </div>
          )}
        </main>

        {/* 하단 도스 프롬프트 스타일 푸터 */}
        <footer className="retro-footer retro-window">
          <p>
            C:\&gt; ECHO &quot;DATA PROVIDED BY OPEN-METEO API • KOREA AIR QUALITY STANDARD&quot;
          </p>
          <span className="blinking-cursor">_</span>
        </footer>
      </div>
    </div>
  )
}
