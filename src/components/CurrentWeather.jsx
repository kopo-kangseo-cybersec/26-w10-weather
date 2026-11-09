import { MapPin, Thermometer, Droplets, Wind } from 'lucide-react'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({ city, current, weatherInfo }) {
  if (!current) return null

  return (
    <section className="card weather-card">
      <div className="card-header">
        <span className="card-badge">현재 날씨</span>
        <span className="location-name">
          <MapPin size={16} />
          {city.name}
        </span>
      </div>

      <div className="weather-main-info">
        <div className="icon-wrapper">
          <WeatherIcon
            iconName={weatherInfo?.icon}
            size={64}
            color={weatherInfo?.color || '#3b82f6'}
          />
          <span className="weather-desc" style={{ color: weatherInfo?.color }}>
            {weatherInfo?.label}
          </span>
        </div>
        <div className="temp-display">
          <span className="temperature">
            {Math.round(current.temperature_2m)}
          </span>
          <span className="unit">°C</span>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <Thermometer size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="label">체감 온도</span>
            <span className="value">
              {Math.round(current.apparent_temperature)}°C
            </span>
          </div>
        </div>

        <div className="detail-item">
          <Droplets size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="label">상대 습도</span>
            <span className="value">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="detail-item">
          <Wind size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="label">풍속</span>
            <span className="value">{current.wind_speed_10m} m/s</span>
          </div>
        </div>
      </div>
    </section>
  )
}

