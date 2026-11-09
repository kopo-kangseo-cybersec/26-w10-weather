import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Sunset,
  Sunrise,
  CloudRain,
} from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function CurrentWeather({ city, weather, unit = 'C', convertTemp }) {
  const current = weather?.current
  const daily = weather?.daily
  if (!current) return null

  const info = getWeatherInfo(current.weather_code)

  // 옵션 C: 상세 기상 지표 (일출, 일몰, UV 지수, 강수 확률)
  const sunriseStr = daily?.sunrise?.[0]
    ? new Date(daily.sunrise[0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : '-'
  const sunsetStr = daily?.sunset?.[0]
    ? new Date(daily.sunset[0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : '-'
  const uvIndex = daily?.uv_index_max?.[0] ?? '-'
  const precipProb = daily?.precipitation_probability_max?.[0] ?? 0

  const displayTemp = convertTemp ? convertTemp(current.temperature_2m) : Math.round(current.temperature_2m)
  const displayApparent = convertTemp ? convertTemp(current.apparent_temperature) : Math.round(current.apparent_temperature)

  return (
    <article className="card weather-card retro-window">
      <div className="retro-titlebar">
        <span className="title-text">WEATHER.EXE - {city.name}</span>
        <div className="titlebar-controls">
          <span className="win-btn">_</span>
          <span className="win-btn">■</span>
          <span className="win-btn">X</span>
        </div>
      </div>

      <div className="card-header retro-card-header">
        <span className="card-tag">[CURRENT_STATUS]</span>
        <span className="location-name">{city.name}</span>
      </div>

      <div className="weather-main-info retro-main-info">
        <div className="weather-icon-wrapper retro-icon-wrapper">
          <WeatherIcon iconName={info.icon} size={16} color={info.color} />
        </div>
        <div className="temp-wrapper">
          <div className="current-temp retro-temp">
            {displayTemp}
            <span className="temp-unit">°{unit}</span>
          </div>
          <div className="weather-status-label" style={{ color: info.color }}>
            [{info.label}]
          </div>
        </div>
      </div>

      {/* 기본 기상 지표 */}
      <div className="weather-details-grid retro-grid">
        <div className="detail-item">
          <Thermometer size={16} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">체감온도:</span>
            <span className="detail-value">{displayApparent}°{unit}</span>
          </div>
        </div>

        <div className="detail-item">
          <Droplets size={16} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">습도:</span>
            <span className="detail-value">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="detail-item">
          <Wind size={16} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">풍속:</span>
            <span className="detail-value">{current.wind_speed_10m} km/h</span>
          </div>
        </div>
      </div>

      {/* 옵션 C: 상세 기상 지표 (UV 지수, 일출, 일몰, 강수 확률) */}
      <div className="weather-extra-details retro-extra-grid">
        <div className="extra-item">
          <Sun size={16} className="detail-icon" />
          <span className="extra-label">자외선(UV):</span>
          <span className="extra-value">{uvIndex}</span>
        </div>

        <div className="extra-item">
          <CloudRain size={16} className="detail-icon" />
          <span className="extra-label">강수확률:</span>
          <span className="extra-value">{precipProb}%</span>
        </div>

        <div className="extra-item">
          <Sunrise size={16} className="detail-icon" />
          <span className="extra-label">일출:</span>
          <span className="extra-value">{sunriseStr}</span>
        </div>

        <div className="extra-item">
          <Sunset size={16} className="detail-icon" />
          <span className="extra-label">일몰:</span>
          <span className="extra-value">{sunsetStr}</span>
        </div>
      </div>
    </article>
  )
}
