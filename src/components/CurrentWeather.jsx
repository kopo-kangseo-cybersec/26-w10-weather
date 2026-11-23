import { MapPin, Thermometer, Droplets, Wind, Calendar } from 'lucide-react'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({ currentWeather, weatherInfo, cityName }) {
  if (!currentWeather || !weatherInfo) return null

  return (
    <article className="card weather-card">
      <div className="card-header">
        <span className="card-badge">현재 날씨</span>
        <span className="location-name">
          <MapPin size={16} /> {cityName}
        </span>
      </div>

      <div className="weather-main">
        <div className="weather-icon-wrap" style={{ color: weatherInfo.color }}>
          <WeatherIcon name={weatherInfo.icon} size={64} color={weatherInfo.color} />
          <span className="weather-label">{weatherInfo.label}</span>
        </div>
        <div className="weather-temp-wrap">
          <span className="current-temp">{Math.round(currentWeather.temperature_2m)}°</span>
          <span className="temp-unit">C</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <Thermometer size={18} className="metric-icon" color="#f97316" />
          <div className="metric-info">
            <span className="metric-label">체감 온도</span>
            <span className="metric-val">{Math.round(currentWeather.apparent_temperature)}°C</span>
          </div>
        </div>
        <div className="metric-item">
          <Droplets size={18} className="metric-icon" color="#38bdf8" />
          <div className="metric-info">
            <span className="metric-label">습도</span>
            <span className="metric-val">{currentWeather.relative_humidity_2m}%</span>
          </div>
        </div>
        <div className="metric-item">
          <Wind size={18} className="metric-icon" color="#64748b" />
          <div className="metric-info">
            <span className="metric-label">풍속</span>
            <span className="metric-val">{currentWeather.wind_speed_10m} km/h</span>
          </div>
        </div>
        <div className="metric-item">
          <Calendar size={18} className="metric-icon" color="#8b5cf6" />
          <div className="metric-info">
            <span className="metric-label">강수량</span>
            <span className="metric-val">{currentWeather.precipitation || 0} mm</span>
          </div>
        </div>
      </div>
    </article>
  )
}
