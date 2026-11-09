import { useState, useEffect } from 'react';
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  AlertCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';
import './App.css';

// lucide-react 날씨 아이콘 컴포넌트 매퍼
function WeatherIcon({ iconName, size = 48, color = '#f59e0b' }) {
  const iconProps = { size, color, strokeWidth: 2 };
  switch (iconName) {
    case 'Sun':
      return <Sun {...iconProps} />;
    case 'SunDim':
      return <SunDim {...iconProps} />;
    case 'CloudSun':
      return <CloudSun {...iconProps} />;
    case 'CloudFog':
      return <CloudFog {...iconProps} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...iconProps} />;
    case 'CloudRain':
      return <CloudRain {...iconProps} />;
    case 'Snowflake':
      return <Snowflake {...iconProps} />;
    case 'CloudLightning':
      return <CloudLightning {...iconProps} />;
    case 'Cloud':
    default:
      return <Cloud {...iconProps} />;
  }
}

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airData, setAirData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // 날씨 및 미세먼지 정보 병렬 조회
  const loadCityData = async (city) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [weather, air] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ]);
      setWeatherData(weather);
      setAirData(air);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('데이터 조회 오류:', err);
      setErrorMessage(err.message || '기상 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCityData(selectedCity);
  }, [selectedCity]);

  // 현재 날씨 계산
  const currentWeather = weatherData?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null;

  // 현재 미세먼지 계산
  const currentAir = airData?.current;
  const pm10 = currentAir?.pm10 ?? null;
  const pm25 = currentAir?.pm2_5 ?? null;
  const airStatus = (pm10 !== null && pm25 !== null) ? getAirQualityStatus(pm10, pm25) : null;

  return (
    <div className="weather-app">
      {/* 1. 상단 헤더 */}
      <header className="header-section">
        <div className="title-area">
          <div className="brand-badge">
            <Sparkles size={16} /> Open-Meteo 실시간 연동
          </div>
          <h1>기상 및 미세먼지 대시보드</h1>
          <p className="subtitle">국내 주요 도시의 실시간 기상 상태와 대기질을 한눈에 확인하세요</p>
        </div>
        <div className="header-meta">
          {lastUpdated && <span className="last-updated">마지막 업데이트: {lastUpdated}</span>}
          <button
            type="button"
            className="refresh-btn"
            onClick={() => loadCityData(selectedCity)}
            disabled={isLoading}
            title="새로고침"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
            <span>새로고침</span>
          </button>
        </div>
      </header>

      {/* 2. 도시 빠른 선택 버튼 목록 */}
      <nav className="city-nav" aria-label="도시 빠른 선택">
        <div className="city-nav-title">
          <MapPin size={16} /> 주요 도시 선택
        </div>
        <div className="city-buttons-wrapper">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = city.name === selectedCity.name;
            return (
              <button
                key={city.name}
                type="button"
                className={`city-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
                disabled={isLoading && isSelected}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. 에러 안내 배너 */}
      {errorMessage && (
        <div className="error-banner">
          <AlertCircle size={22} color="#ef4444" />
          <div className="error-text">
            <strong>데이터 로드 실패</strong>
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            className="retry-btn"
            onClick={() => loadCityData(selectedCity)}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 4. 로딩 표시 */}
      {isLoading && !weatherData && (
        <div className="loading-card">
          <RefreshCw size={36} className="spinning text-primary" />
          <p>{selectedCity.name} 기상 정보를 불러오는 중입니다...</p>
        </div>
      )}

      {/* 5. 메인 대시보드 그리드 */}
      {weatherData && (
        <main className={`dashboard-grid ${isLoading ? 'is-refreshing' : ''}`}>
          {/* 날씨 카드 */}
          <section className="card weather-card">
            <div className="card-header">
              <span className="card-badge">현재 날씨</span>
              <h2 className="city-title">{selectedCity.name}</h2>
            </div>

            <div className="weather-primary">
              <div className="weather-icon-wrapper" style={{ backgroundColor: `${weatherInfo?.color}15` }}>
                <WeatherIcon iconName={weatherInfo?.icon} size={64} color={weatherInfo?.color} />
              </div>
              <div className="temp-block">
                <span className="temp-value">{Math.round(currentWeather.temperature_2m)}</span>
                <span className="temp-unit">°C</span>
              </div>
              <div className="condition-tag" style={{ borderColor: weatherInfo?.color, color: weatherInfo?.color }}>
                {weatherInfo?.label}
              </div>
            </div>

            <div className="weather-sub-metrics">
              <div className="metric-box">
                <div className="metric-icon"><Thermometer size={18} /></div>
                <div className="metric-info">
                  <span className="metric-label">체감 온도</span>
                  <span className="metric-val">{Math.round(currentWeather.apparent_temperature)}°C</span>
                </div>
              </div>
              <div className="metric-box">
                <div className="metric-icon"><Droplets size={18} /></div>
                <div className="metric-info">
                  <span className="metric-label">상대 습도</span>
                  <span className="metric-val">{currentWeather.relative_humidity_2m}%</span>
                </div>
              </div>
              <div className="metric-box">
                <div className="metric-icon"><Wind size={18} /></div>
                <div className="metric-info">
                  <span className="metric-label">바람 세기</span>
                  <span className="metric-val">{currentWeather.wind_speed_10m} km/h</span>
                </div>
              </div>
            </div>
          </section>

          {/* 미세먼지 카드 */}
          <section className="card air-card">
            <div className="card-header">
              <span className="card-badge">대기질 지표</span>
              <h2 className="city-title">미세먼지 현황</h2>
            </div>

            <div className="air-primary">
              <div
                className="air-badge"
                style={{
                  backgroundColor: `${airStatus?.badgeColor}18`,
                  color: airStatus?.badgeColor,
                  borderColor: airStatus?.badgeColor,
                }}
              >
                <span className="air-status-text">{airStatus?.status || '측정 중'}</span>
                <span className="air-guide-label">환경부 기준</span>
              </div>
            </div>

            <div className="air-sub-metrics">
              <div className="metric-box">
                <div className="metric-info">
                  <div className="metric-label-row">
                    <span className="metric-label">미세먼지 (PM10)</span>
                    <span className="metric-grade">
                      {pm10 !== null ? (pm10 <= 30 ? '좋음' : pm10 <= 80 ? '보통' : pm10 <= 150 ? '나쁨' : '매우 나쁨') : '-'}
                    </span>
                  </div>
                  <div className="metric-num-row">
                    <span className="air-val">{pm10 !== null ? Math.round(pm10) : '-'}</span>
                    <span className="air-unit">㎍/㎥</span>
                  </div>
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-info">
                  <div className="metric-label-row">
                    <span className="metric-label">초미세먼지 (PM2.5)</span>
                    <span className="metric-grade">
                      {pm25 !== null ? (pm25 <= 15 ? '좋음' : pm25 <= 35 ? '보통' : pm25 <= 75 ? '나쁨' : '매우 나쁨') : '-'}
                    </span>
                  </div>
                  <div className="metric-num-row">
                    <span className="air-val">{pm25 !== null ? Math.round(pm25) : '-'}</span>
                    <span className="air-unit">㎍/㎥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 환경부 등급 기준 가이드 */}
            <div className="air-standards">
              <div className="standard-item"><span className="dot good"></span>좋음 (0~30)</div>
              <div className="standard-item"><span className="dot moderate"></span>보통 (31~80)</div>
              <div className="standard-item"><span className="dot unhealthy"></span>나쁨 (81~150)</div>
              <div className="standard-item"><span className="dot very-unhealthy"></span>매우나쁨 (151~)</div>
            </div>
          </section>
        </main>
      )}

      {/* 푸터 */}
      <footer className="footer-section">
        <p>
          기상 및 대기질 데이터 출처: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo API</a> (비영리 오픈 기상 프로젝트)
        </p>
      </footer>
    </div>
  );
}

export default App;
