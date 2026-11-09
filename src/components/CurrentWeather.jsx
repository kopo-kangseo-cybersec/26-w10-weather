import { Thermometer, Droplets, Wind } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function CurrentWeather({ city, weather }) {
  const current = weather?.current
  if (!current) return null

  const info = getWeatherInfo(current.weather_code)

  return (
    <article className="card weather-card">
      <div className="card-header">
        <span className="card-tag">현재 날씨</span>
        <span className="location-name">{city.name}</span>
      </div>

      <div className="weather-main-info">
        <div
          className="weather-icon-wrapper"
          style={{ backgroundColor: `${info.color}15` }}
        >
          <WeatherIcon iconName={info.icon} size={64} color={info.color} />
        </div>
        <div className="temp-wrapper">
          <div className="current-temp">
            {Math.round(current.temperature_2m)}
            <span className="temp-unit">°C</span>
          </div>
          <div className="weather-status-label" style={{ color: info.color }}>
            {info.label}
          </div>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <Thermometer size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">체감 온도</span>
            <span className="detail-value">{Math.round(current.apparent_temperature)}°C</span>
          </div>
        </div>

        <div className="detail-item">
          <Droplets size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">습도</span>
            <span className="detail-value">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="detail-item">
          <Wind size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">풍속</span>
            <span className="detail-value">{current.wind_speed_10m} km/h</span>
          </div>
        </div>
      </div>
    </article>
  )
}

