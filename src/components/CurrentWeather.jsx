import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  CloudRain,
  Sun,
} from 'lucide-react'
import { getUvIndexStatus } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({ city, current, weatherInfo, daily }) {
  if (!current) return null

  // 오늘 상세 지표 파싱 (일출/일몰, 자외선 지수, 강수 확률)
  const todaySunrise = daily?.sunrise?.[0] ? daily.sunrise[0].split('T')[1] : null
  const todaySunset = daily?.sunset?.[0] ? daily.sunset[0].split('T')[1] : null
  const todayUv = daily?.uv_index_max?.[0] != null ? Math.round(daily.uv_index_max[0] * 10) / 10 : null
  const todayPop = daily?.precipitation_probability_max?.[0] != null ? daily.precipitation_probability_max[0] : null
  const uvStatus = todayUv != null ? getUvIndexStatus(todayUv) : null

  return (
    <section className="card weather-card">
      <div className="card-header">
        <span className="card-badge">현재 날씨 & 상세 지표</span>
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

      {/* 6대 기상 상세 지표 그리드 (체감온도, 습도, 풍속, 강수확률, 자외선, 일출/일몰) */}
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

        <div className="detail-item">
          <CloudRain size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="label">최고 강수확률</span>
            <span className="value">{todayPop != null ? `${todayPop}%` : '-'}</span>
          </div>
        </div>

        <div className="detail-item">
          <Sun size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="label">자외선 지수(UV)</span>
            <div className="metric-with-badge">
              <span className="value">{todayUv != null ? todayUv : '-'}</span>
              {uvStatus && (
                <span
                  className="mini-badge"
                  style={{ backgroundColor: uvStatus.color }}
                >
                  {uvStatus.level}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-item">
          <div className="sunrise-sunset-icons">
            <Sunrise size={16} title="일출" />
            <Sunset size={16} title="일몰" />
          </div>
          <div className="detail-text">
            <span className="label">일출 / 일몰</span>
            <span className="value sun-times">
              {todaySunrise && todaySunset ? `${todaySunrise} / ${todaySunset}` : '-'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
