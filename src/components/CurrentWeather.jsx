import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  Calendar
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function CurrentWeather({ city, weather, tempUnit = 'C' }) {
  if (!weather || !weather.current) return null;

  const current = weather.current;
  const info = getWeatherInfo(current.weather_code);

  // 온도 변환 함수 (°C -> °F)
  const formatTemp = (celsius) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const isDay = current.is_day === 1;

  // 오늘 날짜 포맷
  const todayStr = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="card current-weather-card">
      <div className="card-header">
        <div className="location-info">
          <div className="city-title">
            <MapPin size={22} className="pin-icon" />
            <h2>{city.name}</h2>
          </div>
          <span className="date-str">
            <Calendar size={14} />
            {todayStr}
          </span>
        </div>
        <div className="day-night-badge">
          <span>{isDay ? '주간 ☀️' : '야간 🌙'}</span>
        </div>
      </div>

      <div className="main-weather-display">
        <div className="temp-section">
          <div className="main-temp">{formatTemp(current.temperature_2m)}</div>
          <div className="weather-status-badge" style={{ backgroundColor: `${info.color}22`, color: info.color }}>
            <span className="status-dot" style={{ backgroundColor: info.color }} />
            {info.label}
          </div>
        </div>

        <div className="weather-icon-wrapper" style={{ color: info.color }}>
          <WeatherIcon name={info.icon} isDay={current.is_day} size={84} />
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <div className="detail-icon" style={{ color: '#f59e0b' }}>
            <Thermometer size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">체감 온도</span>
            <span className="detail-value">{formatTemp(current.apparent_temperature)}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon" style={{ color: '#38bdf8' }}>
            <Droplets size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">습도</span>
            <span className="detail-value">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon" style={{ color: '#10b981' }}>
            <Wind size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">풍속</span>
            <span className="detail-value">{current.wind_speed_10m} km/h</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon" style={{ color: '#6366f1' }}>
            <CloudRain size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">강수량</span>
            <span className="detail-value">{current.precipitation} mm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
