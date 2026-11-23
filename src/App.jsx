import { useState, useEffect } from 'react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather';
import CityPresetButtons from './components/CityPresetButtons';
import CitySearch from './components/CitySearch';
import RecentCities from './components/RecentCities';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyChart from './components/HourlyChart';
import WeeklyForecast from './components/WeeklyForecast';
import {
  CloudSun,
  RefreshCw,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import './App.css';

const STORAGE_KEY_RECENT = 'w10_recent_cities';
const STORAGE_KEY_UNIT = 'w10_temp_unit';

export default function App() {
  // 1. 선택된 도시 상태 (기본값: 서울 강서)
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);

  // 2. 날씨 및 미세먼지 데이터 상태
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. 커스터마이징 기능: 최근 본 도시 (localStorage 연동)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. 커스터마이징 기능: 온도 단위 변환 (°C / °F)
  const [tempUnit, setTempUnit] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_UNIT) || 'C';
  });

  const toggleTempUnit = () => {
    const nextUnit = tempUnit === 'C' ? 'F' : 'C';
    setTempUnit(nextUnit);
    localStorage.setItem(STORAGE_KEY_UNIT, nextUnit);
  };

  // 데이터 로드 함수 (병렬 비동기 호출)
  const loadData = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const [weather, air] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ]);
      setWeatherData(weather);
      setAirQualityData(air);

      // 최근 본 도시 업데이트 (중복 제거 및 최신 순 상위 5개 유지)
      setRecentCities((prev) => {
        const filtered = prev.filter((c) => c.name !== city.name);
        const updated = [city, ...filtered].slice(0, 5);
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError(err.message || '날씨 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 도시 변경 시 데이터 로드
  useEffect(() => {
    loadData(selectedCity);
  }, [selectedCity]);

  // 최근 본 도시 삭제 핸들러
  const handleRemoveRecentCity = (cityName) => {
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      return updated;
    });
  };

  // 5. 커스터마이징 기능: 날씨 상태 및 낮/밤에 따른 동적 비주얼 테마
  const getThemeClass = () => {
    if (!weatherData?.current) return 'theme-default';
    const { is_day, weather_code } = weatherData.current;
    const isDay = is_day === 1;

    // 비/소나기/뇌우
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weather_code)) {
      return isDay ? 'theme-rain-day' : 'theme-rain-night';
    }
    // 눈
    if ([71, 73, 75, 77].includes(weather_code)) {
      return isDay ? 'theme-snow-day' : 'theme-snow-night';
    }
    // 안개/흐림
    if ([3, 45, 48].includes(weather_code)) {
      return isDay ? 'theme-cloudy-day' : 'theme-cloudy-night';
    }
    // 맑음/구름조금
    return isDay ? 'theme-clear-day' : 'theme-clear-night';
  };

  return (
    <div className={`app-container ${getThemeClass()}`}>
      <div className="app-content-wrapper">
        {/* 상단 네비게이션 헤더 */}
        <header className="app-header">
          <div className="brand">
            <CloudSun className="brand-icon" size={32} />
            <div>
              <h1 className="brand-title">SkyPulse Weather</h1>
              <p className="brand-subtitle">실시간 날씨 & 미세먼지 스마트 대시보드</p>
            </div>
          </div>

          <div className="header-controls">
            {/* 단위 변환 토글 스위치 */}
            <button
              type="button"
              className="unit-toggle-btn"
              onClick={toggleTempUnit}
              title="섭씨/화씨 단위 변환"
            >
              <Thermometer size={16} />
              <span>{tempUnit === 'C' ? '°C로 표시 중' : '°F로 표시 중'}</span>
              <strong className="toggle-badge">{tempUnit === 'C' ? '→ °F' : '→ °C'}</strong>
            </button>

            {/* 새로고침 버튼 */}
            <button
              type="button"
              className="refresh-btn"
              onClick={() => loadData(selectedCity)}
              disabled={loading}
              title="데이터 새로고침"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* 도시 검색 입력창 (400ms 디바운스 적용) */}
        <section className="search-section">
          <CitySearch onSelectCity={setSelectedCity} />
        </section>

        {/* 상단 8대 주요 도시 프리셋 버튼 */}
        <section className="presets-section">
          <CityPresetButtons
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
        </section>

        {/* 최근 본 도시 뱃지 */}
        <section className="recent-section">
          <RecentCities
            recentCities={recentCities}
            onSelectCity={setSelectedCity}
            onRemoveCity={handleRemoveRecentCity}
          />
        </section>

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="state-notice loading-notice">
            <Loader2 className="animate-spin" size={32} />
            <p>최신 기상 및 대기질 데이터를 수신하고 있습니다...</p>
          </div>
        )}

        {/* 에러 발생 안내 */}
        {error && !loading && (
          <div className="state-notice error-notice">
            <AlertTriangle size={32} />
            <h3>기상 데이터를 불러오지 못했습니다</h3>
            <p>{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadData(selectedCity)}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 대시보드 본문 (로딩 완료 시 표시) */}
        {!loading && !error && weatherData && airQualityData && (
          <main className="dashboard-grid">
            {/* 상단 2열: 현재 날씨 카드 + 미세먼지 카드 */}
            <div className="row-overview">
              <CurrentWeather
                city={selectedCity}
                weather={weatherData}
                tempUnit={tempUnit}
              />
              <AirQualityCard airQuality={airQualityData} />
            </div>

            {/* 중단: 24시간 시간별 기온 SVG 꺾은선 차트 */}
            <div className="row-hourly">
              <HourlyChart
                hourly={weatherData.hourly}
                tempUnit={tempUnit}
              />
            </div>

            {/* 하단: 7일간 주간 예보 */}
            <div className="row-weekly">
              <WeeklyForecast
                daily={weatherData.daily}
                tempUnit={tempUnit}
              />
            </div>
          </main>
        )}

        {/* 푸터: 사이버보안 체크포인트 설명 */}
        <footer className="app-footer">
          <div className="security-info-box">
            <div className="security-title">
              <ShieldCheck size={18} />
              <span>사이버보안과 개발 아키텍처 체크포인트</span>
            </div>
            <p>
              • <strong>공개 API 아키텍처</strong>: Open-Meteo는 API Key가 필요 없는 공개 API로 안전하게 클라이언트 직접 호출을 지원합니다. (비밀 키가 필요한 유료 API는 반드시 백엔드 프록시 서버(BFF)를 두어 키 탈취를 방지해야 합니다.)
            </p>
            <p>
              • <strong>DoS 방어 디바운싱(Debounce)</strong>: 도시 검색창에 400ms 디바운스를 적용하여 불필요한 연속 API 호출을 차단하고 429 Too Many Requests 방지 처리를 완료했습니다.
            </p>
          </div>
          <p className="copyright">© 2026 한국폴리텍대학 강서캠퍼스 사이버보안과 — 10주차 기상 대시보드</p>
        </footer>
      </div>
    </div>
  );
}
