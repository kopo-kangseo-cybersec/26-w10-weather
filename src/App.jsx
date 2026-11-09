import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RefreshCw,
  AlertCircle,
  History,
  X,
  Monitor,
  Check,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
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

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 옵션 D: 섭씨(°C)와 화씨(°F) 단위
  const [unit, setUnit] = useState('C')

  // 테마 상태: 'auto'(기상기반), 'win31', 'green', 'amber', 'high-contrast'(고대비 다크)
  const [colorMode, setColorMode] = useState('auto')
  const [isHighContrast, setIsHighContrast] = useState(false)

  // 상단 메뉴 드롭다운 상태 ('File' | 'Edit' | 'View' | 'Help' | null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const menuBarRef = useRef(null)

  const convertTemp = useCallback(
    (celsius) => {
      if (unit === 'F') {
        return Math.round((celsius * 9) / 5 + 32)
      }
      return Math.round(celsius)
    },
    [unit]
  )

  // 최근 본 도시 목록 (localStorage)
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

  const handleClearAllRecent = () => {
    setRecentCities([])
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY)
    } catch (err) {
      console.error(err)
    }
    setActiveMenu(null)
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

  // 메뉴 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 동적 테마 클래스 계산
  const getCalculatedThemeClass = () => {
    if (isHighContrast) return 'retro-theme-high-contrast'
    if (colorMode === 'win31') return 'retro-theme-win31'
    if (colorMode === 'green') return 'retro-theme-green'
    if (colorMode === 'amber') return 'retro-theme-amber'

    // Auto 모드
    if (!weather?.current) return 'retro-theme-win31'
    const { weather_code, is_day } = weather.current
    if ([51, 53, 55, 61, 63, 65, 71, 73, 75, 77, 80, 81, 82, 95].includes(weather_code)) {
      return 'retro-theme-amber'
    }
    if (is_day === 0) {
      return 'retro-theme-green'
    }
    return 'retro-theme-win31'
  }

  const themeClass = getCalculatedThemeClass()

  return (
    <div className={`retro-desktop-wrapper ${themeClass}`}>
      <div className="retro-app-container">
        {/* 상단 Windows 3.1 메인 창 프레임 */}
        <header className="retro-main-window retro-window">
          <div className="retro-titlebar">
            <div className="titlebar-left">
              <Monitor size={16} className="titlebar-icon" />
              <span className="title-text">
                MS-DOS Weather System v3.11 [{isHighContrast ? 'HIGH-CONTRAST DARK' : colorMode.toUpperCase()}]
              </span>
            </div>
            <div className="titlebar-controls">
              <span
                className="win-btn"
                title="고대비 다크모드 토글"
                onClick={() => setIsHighContrast((prev) => !prev)}
              >
                {isHighContrast ? '☼' : '☾'}
              </span>
              <span className="win-btn" onClick={() => loadCityData(selectedCity)} title="새로고침">
                ↻
              </span>
              <span className="win-btn" onClick={() => setShowAboutModal(true)} title="정보">
                ?
              </span>
            </div>
          </div>

          {/* ==========================================================================
             작동 가능한 레트로 메뉴 바 (File, Edit, View, Help)
             ========================================================================== */}
          <div className="retro-menubar" ref={menuBarRef}>
            {/* File 메뉴 */}
            <div className="menu-dropdown-wrapper">
              <span
                className={`menu-item ${activeMenu === 'File' ? 'active' : ''}`}
                onClick={() => setActiveMenu(activeMenu === 'File' ? null : 'File')}
              >
                <u>F</u>ile
              </span>
              {activeMenu === 'File' && (
                <div className="retro-dropdown-menu">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      loadCityData(selectedCity)
                      setActiveMenu(null)
                    }}
                  >
                    <span>↻ Refresh Telemetry</span>
                    <span className="shortcut">F5</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={handleClearAllRecent}
                  >
                    <span>🗑 Clear Recent Cities</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCity(DEFAULT_CITIES[0])
                      setActiveMenu(null)
                    }}
                  >
                    <span>⏏ Reset to Default City</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit 메뉴 */}
            <div className="menu-dropdown-wrapper">
              <span
                className={`menu-item ${activeMenu === 'Edit' ? 'active' : ''}`}
                onClick={() => setActiveMenu(activeMenu === 'Edit' ? null : 'Edit')}
              >
                <u>E</u>dit
              </span>
              {activeMenu === 'Edit' && (
                <div className="retro-dropdown-menu">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setUnit((prev) => (prev === 'C' ? 'F' : 'C'))
                      setActiveMenu(null)
                    }}
                  >
                    <span>Toggle Unit: {unit === 'C' ? '°C → °F' : '°F → °C'}</span>
                    <span className="shortcut">Tab</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      const input = document.querySelector('.search-input')
                      if (input) input.focus()
                      setActiveMenu(null)
                    }}
                  >
                    <span>🔍 Focus City Search</span>
                    <span className="shortcut">/</span>
                  </button>
                </div>
              )}
            </div>

            {/* View 메뉴 (다크모드 & 고대비 & 테마 전환) */}
            <div className="menu-dropdown-wrapper">
              <span
                className={`menu-item ${activeMenu === 'View' ? 'active' : ''}`}
                onClick={() => setActiveMenu(activeMenu === 'View' ? null : 'View')}
              >
                <u>V</u>iew
              </span>
              {activeMenu === 'View' && (
                <div className="retro-dropdown-menu">
                  <button
                    type="button"
                    className={`dropdown-item ${isHighContrast ? 'selected' : ''}`}
                    onClick={() => {
                      setIsHighContrast((prev) => !prev)
                      setActiveMenu(null)
                    }}
                  >
                    <span>
                      {isHighContrast ? '✓ ' : '  '}High-Contrast Dark Mode (고대비 다크)
                    </span>
                    <span className="shortcut">Shift+D</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className={`dropdown-item ${colorMode === 'auto' && !isHighContrast ? 'selected' : ''}`}
                    onClick={() => {
                      setColorMode('auto')
                      setIsHighContrast(false)
                      setActiveMenu(null)
                    }}
                  >
                    <span>{colorMode === 'auto' && !isHighContrast ? '✓ ' : '  '}Auto (기상/주야간 연동)</span>
                  </button>
                  <button
                    type="button"
                    className={`dropdown-item ${colorMode === 'win31' && !isHighContrast ? 'selected' : ''}`}
                    onClick={() => {
                      setColorMode('win31')
                      setIsHighContrast(false)
                      setActiveMenu(null)
                    }}
                  >
                    <span>{colorMode === 'win31' && !isHighContrast ? '✓ ' : '  '}Windows 3.1 Teal</span>
                  </button>
                  <button
                    type="button"
                    className={`dropdown-item ${colorMode === 'green' && !isHighContrast ? 'selected' : ''}`}
                    onClick={() => {
                      setColorMode('green')
                      setIsHighContrast(false)
                      setActiveMenu(null)
                    }}
                  >
                    <span>{colorMode === 'green' && !isHighContrast ? '✓ ' : '  '}DOS Green CRT</span>
                  </button>
                  <button
                    type="button"
                    className={`dropdown-item ${colorMode === 'amber' && !isHighContrast ? 'selected' : ''}`}
                    onClick={() => {
                      setColorMode('amber')
                      setIsHighContrast(false)
                      setActiveMenu(null)
                    }}
                  >
                    <span>{colorMode === 'amber' && !isHighContrast ? '✓ ' : '  '}Amber CRT Phosphor</span>
                  </button>
                </div>
              )}
            </div>

            {/* Help 메뉴 */}
            <div className="menu-dropdown-wrapper">
              <span
                className={`menu-item ${activeMenu === 'Help' ? 'active' : ''}`}
                onClick={() => setActiveMenu(activeMenu === 'Help' ? null : 'Help')}
              >
                <u>H</u>elp
              </span>
              {activeMenu === 'Help' && (
                <div className="retro-dropdown-menu">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowAboutModal(true)
                      setActiveMenu(null)
                    }}
                  >
                    <span>ℹ About MS-DOS Weather...</span>
                  </button>
                </div>
              )}
            </div>

            {/* 우측 고속 토글: 고대비 다크모드 + 단위 변환 */}
            <div className="menu-quick-tools">
              <button
                type="button"
                className={`retro-contrast-toggle-btn ${isHighContrast ? 'active' : ''}`}
                onClick={() => setIsHighContrast((prev) => !prev)}
                title="고대비 다크모드 전환"
              >
                [CONTRAST: {isHighContrast ? 'HIGH-DARK' : 'NORMAL'}]
              </button>

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
          </div>

          <div className="retro-header-body">
            <h1 className="retro-cli-title">C:\WEATHER&gt; METEO_DASHBOARD.EXE</h1>
            <p className="retro-cli-sub">
              &gt;&gt; Open-Meteo Realtime Telemetry Station (Terminal Mode • {isHighContrast ? 'HIGH CONTRAST ACTIVE' : 'STANDARD'})
            </p>
          </div>

          {/* 도시 검색 입력창 */}
          <div className="retro-search-wrap">
            <CitySearch onSelectCity={handleSelectCity} />
          </div>
        </header>

        {/* 최근 본 도시 뱃지 바 */}
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
            C:\&gt; ECHO &quot;MS-DOS WEATHER TELEMETRY STATION • KOREA AIR QUALITY STANDARD&quot;
          </p>
          <span className="blinking-cursor">_</span>
        </footer>
      </div>

      {/* ==========================================================================
         Windows 3.1 클래식 About 다이얼로그 모달
         ========================================================================== */}
      {showAboutModal && (
        <div className="retro-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="retro-modal-window retro-window" onClick={(e) => e.stopPropagation()}>
            <div className="retro-titlebar">
              <span className="title-text">About Weather System</span>
              <div className="titlebar-controls">
                <span className="win-btn" onClick={() => setShowAboutModal(false)}>X</span>
              </div>
            </div>
            <div className="modal-content-body">
              <div className="modal-icon-row">
                <Monitor size={32} />
                <div className="modal-app-info">
                  <h3>MS-DOS &amp; Windows 3.11 Weather</h3>
                  <p>Version 3.11.2026 Release (Build 26-W10)</p>
                  <p>Cybersecurity &amp; Realtime Telemetry Station</p>
                </div>
              </div>
              <hr className="modal-divider" />
              <div className="modal-features">
                <p>• Data Source: Open-Meteo REST API (HTTPS Protocol)</p>
                <p>• UI Architecture: Modular React 19 Components</p>
                <p>• Security Layer: Decoupled API Handler &amp; 400ms Debounce</p>
                <p>• Themes: High-Contrast Dark, DOS Green CRT, Amber CRT, Win3.1</p>
              </div>
              <div className="modal-button-row">
                <button
                  type="button"
                  className="retro-btn modal-ok-btn"
                  onClick={() => setShowAboutModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
