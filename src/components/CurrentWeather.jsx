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
} from 'lucide-react'
import { getWeatherInfo } from '../api/weather'

const ICON_MAP = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
}

function WeatherIcon({ name, size = 48, color = 'currentColor', className = '' }) {
  const IconComp = ICON_MAP[name] || Cloud
  return <IconComp size={size} color={color} className={className} />
}

export default function CurrentWeather({ city, weather }) {
  const current = weather?.current
  if (!current) return null

  const meta = getWeatherInfo(current.weather_code)

  return (
    <article className="card weather-card">
      <div className="card-header">
        <div>
          <span className="card-tag">현재 기상</span>
          <h2 className="city-title">{city.name}</h2>
        </div>
        {meta && (
          <div
            className="weather-badge"
            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
          >
            <WeatherIcon name={meta.icon} size={20} color={meta.color} />
            <span>{meta.label}</span>
          </div>
        )}
      </div>

      <div className="weather-main-row">
        <div className="weather-icon-large">
          <WeatherIcon
            name={meta?.icon}
            size={72}
            color={meta?.color || '#3b82f6'}
          />
        </div>
        <div className="temperature-group">
          <span className="temp-value">
            {Math.round(current.temperature_2m)}
            <span className="temp-unit">°C</span>
          </span>
          <span className="temp-sub">
            체감 {Math.round(current.apparent_temperature)}°C
          </span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">
            <Thermometer size={16} />
            <span>체감온도</span>
          </div>
          <strong className="metric-value">
            {Math.round(current.apparent_temperature)}°C
          </strong>
        </div>

        <div className="metric-item">
          <div className="metric-label">
            <Droplets size={16} />
            <span>상대습도</span>
          </div>
          <strong className="metric-value">
            {current.relative_humidity_2m}%
          </strong>
        </div>

        <div className="metric-item">
          <div className="metric-label">
            <Wind size={16} />
            <span>풍속</span>
          </div>
          <strong className="metric-value">
            {current.wind_speed_10m} <small>km/h</small>
          </strong>
        </div>
      </div>
    </article>
  )
}
