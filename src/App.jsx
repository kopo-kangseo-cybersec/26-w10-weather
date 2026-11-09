import { useState, useEffect } from 'react';
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
  MapPin,
  AlertCircle,
  Activity,
  CloudRainWind,
} from 'lucide-react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather';
import './App.css';

// Lucide 아이콘 동적 렌더러
const weatherIconMap = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
};

function WeatherIcon({ name, size = 48, color = 'currentColor', className = '' }) {
  const IconComponent = weatherIconMap[name] || Cloud;
  return <IconComponent size={size} color={color} className={className} />;
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 날씨 및 미세먼지 데이터 동시 조회 (도시 변경 또는 새로고침 트리거 시)
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [weather, air] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ]);

        if (!ignore) {
          setWeatherData(weather);
          setAirData(air);
          setLastUpdated(
            new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      } catch (err) {
        console.error('데이터 조회 오류:', err);
        if (!ignore) {
          setError('기상 및 미세먼지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [selectedCity, refreshTrigger]);

  // 도시 선택 핸들러
  const handleCitySelect = (city) => {
    if (city.lat === selectedCity.lat && city.lon === selectedCity.lon) {
      // 같은 도시 클릭 시 새로고침
      setRefreshTrigger((prev) => prev + 1);
      return;
    }
    setSelectedCity(city);
  };

  // 날씨 및 미세먼지 상태 파싱
  const currentWeather = weatherData?.current;
  const currentAir = airData?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null;
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null;

  return (
    <div className="weather-dashboard">
      {/* 1. 상단 헤더 */}
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-icon">
            <Sun className="brand-sun" size={28} />
          </div>
          <div>
            <h1>실시간 날씨 & 미세먼지</h1>
            <p className="subtitle">Open-Meteo API 기반 기상 모니터링</p>
          </div>
        </div>

        <div className="header-actions">
          {lastUpdated && (
            <span className="last-updated">마지막 업데이트: {lastUpdated}</span>
          )}
          <button
            type="button"
            className="refresh-btn"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            disabled={loading}
            title="새로고침"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            <span>새로고침</span>
          </button>
        </div>
      </header>

      {/* 2. 주요 도시 빠른 선택 버튼 바 */}
      <nav className="city-quick-selector" aria-label="주요 도시 선택">
        <div className="selector-label">
          <MapPin size={16} />
          <span>주요 도시</span>
        </div>
        <div className="city-btn-group">
          {DEFAULT_CITIES.map((city) => {
            const isSelected =
              city.name === selectedCity.name &&
              city.lat === selectedCity.lat &&
              city.lon === selectedCity.lon;
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleCitySelect(city)}
                disabled={loading && isSelected}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. 메인 콘텐츠 영역 (로딩 / 에러 / 데이터 카드) */}
      <main className="dashboard-main">
        {loading && !weatherData && !error && (
          <div className="status-container loading-container">
            <div className="spinner"></div>
            <p className="status-text">{selectedCity.name} 기상 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {error && (
          <div className="status-container error-container">
            <AlertCircle size={44} className="error-icon" />
            <h3 className="error-title">데이터 로드 실패</h3>
            <p className="status-text">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
            >
              다시 시도
            </button>
          </div>
        )}

        {!error && weatherData && airData && (
          <div className={`cards-grid ${loading ? 'updating' : ''}`}>
            {/* 현재 날씨 카드 */}
            <section className="card weather-card">
              <div className="card-header">
                <div>
                  <span className="card-badge">현재 날씨</span>
                  <h2 className="city-title">{selectedCity.name}</h2>
                </div>
                <div
                  className="weather-badge"
                  style={{
                    backgroundColor: `${weatherInfo?.color}20`,
                    color: weatherInfo?.color,
                    borderColor: `${weatherInfo?.color}60`,
                  }}
                >
                  <WeatherIcon
                    name={weatherInfo?.icon}
                    size={22}
                    color={weatherInfo?.color}
                  />
                  <span>{weatherInfo?.label}</span>
                </div>
              </div>

              <div className="current-temp-block">
                <div className="temp-display">
                  <span className="temp-number">
                    {Math.round(currentWeather.temperature_2m)}
                  </span>
                  <span className="temp-unit">°C</span>
                </div>
                <div className="weather-icon-large">
                  <WeatherIcon
                    name={weatherInfo?.icon}
                    size={72}
                    color={weatherInfo?.color}
                  />
                </div>
              </div>

              <div className="weather-details-grid">
                <div className="detail-item">
                  <div className="detail-icon-wrap temp-feel">
                    <Thermometer size={18} />
                  </div>
                  <div>
                    <span className="detail-label">체감 온도</span>
                    <strong className="detail-value">
                      {Math.round(currentWeather.apparent_temperature)}°C
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon-wrap humidity">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <span className="detail-label">상대 습도</span>
                    <strong className="detail-value">
                      {currentWeather.relative_humidity_2m}%
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon-wrap wind">
                    <Wind size={18} />
                  </div>
                  <div>
                    <span className="detail-label">풍속</span>
                    <strong className="detail-value">
                      {currentWeather.wind_speed_10m} km/h
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon-wrap rain">
                    <CloudRainWind size={18} />
                  </div>
                  <div>
                    <span className="detail-label">강수량</span>
                    <strong className="detail-value">
                      {currentWeather.precipitation} mm
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* 미세먼지 카드 */}
            <section className="card air-card">
              <div className="card-header">
                <div>
                  <span className="card-badge">대기질 지수</span>
                  <h2 className="city-title">미세먼지 정보</h2>
                </div>
                <div
                  className="air-status-badge"
                  style={{
                    backgroundColor: `${airStatus?.badgeColor}20`,
                    color: airStatus?.badgeColor,
                    borderColor: `${airStatus?.badgeColor}60`,
                  }}
                >
                  <Activity size={18} />
                  <span>{airStatus?.status}</span>
                </div>
              </div>

              <div className="air-summary-banner" style={{ borderColor: airStatus?.badgeColor }}>
                <div className="air-summary-text">
                  <span className="summary-title">환경부 기준 대기질 등급</span>
                  <p className="summary-desc">
                    {airStatus?.status === '좋음' && '야외 활동을 하기에 아주 좋은 공기 상태입니다.'}
                    {airStatus?.status === '보통' && '무난한 공기질입니다. 실외 활동에 무리가 없습니다.'}
                    {airStatus?.status === '나쁨' && '공기가 탁합니다. 호흡기 질환자는 장시간 실외 활동을 자제하세요.'}
                    {airStatus?.status === '매우 나쁨' && '대기질이 매우 나쁩니다. 외출 시 보건용 마스크를 착용하세요.'}
                  </p>
                </div>
                <div
                  className="air-circle-badge"
                  style={{
                    backgroundColor: airStatus?.badgeColor,
                  }}
                >
                  {airStatus?.status}
                </div>
              </div>

              <div className="air-details-grid">
                <div className="air-item">
                  <div className="air-item-head">
                    <span className="air-metric-name">미세먼지 (PM10)</span>
                    <span
                      className="metric-tag"
                      style={{
                        color:
                          currentAir.pm10 <= 30
                            ? '#10b981'
                            : currentAir.pm10 <= 80
                            ? '#3b82f6'
                            : currentAir.pm10 <= 150
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    >
                      {currentAir.pm10 <= 30
                        ? '좋음'
                        : currentAir.pm10 <= 80
                        ? '보통'
                        : currentAir.pm10 <= 150
                        ? '나쁨'
                        : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="air-metric-value">
                    <span className="metric-number">
                      {Math.round(currentAir.pm10)}
                    </span>
                    <span className="metric-unit">μg/m³</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${Math.min((currentAir.pm10 / 200) * 100, 100)}%`,
                        backgroundColor:
                          currentAir.pm10 <= 30
                            ? '#10b981'
                            : currentAir.pm10 <= 80
                            ? '#3b82f6'
                            : currentAir.pm10 <= 150
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    />
                  </div>
                </div>

                <div className="air-item">
                  <div className="air-item-head">
                    <span className="air-metric-name">초미세먼지 (PM2.5)</span>
                    <span
                      className="metric-tag"
                      style={{
                        color:
                          currentAir.pm2_5 <= 15
                            ? '#10b981'
                            : currentAir.pm2_5 <= 35
                            ? '#3b82f6'
                            : currentAir.pm2_5 <= 75
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    >
                      {currentAir.pm2_5 <= 15
                        ? '좋음'
                        : currentAir.pm2_5 <= 35
                        ? '보통'
                        : currentAir.pm2_5 <= 75
                        ? '나쁨'
                        : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="air-metric-value">
                    <span className="metric-number">
                      {Math.round(currentAir.pm2_5)}
                    </span>
                    <span className="metric-unit">μg/m³</span>
                  </div>
                  <div className="metric-bar-bg">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${Math.min((currentAir.pm2_5 / 100) * 100, 100)}%`,
                        backgroundColor:
                          currentAir.pm2_5 <= 15
                            ? '#10b981'
                            : currentAir.pm2_5 <= 35
                            ? '#3b82f6'
                            : currentAir.pm2_5 <= 75
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 4. 푸터 */}
      <footer className="dashboard-footer">
        <p>
          기상 및 대기질 데이터 출처: <strong>Open-Meteo Public API</strong> (비영리 오픈 기상 프로젝트)
        </p>
      </footer>
    </div>
  );
}
