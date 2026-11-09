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
  Calendar,
  Droplets,
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

function WeatherIcon({ name, size = 24, color = 'currentColor', className = '' }) {
  const IconComp = ICON_MAP[name] || Cloud
  return <IconComp size={size} color={color} className={className} />
}

export default function WeeklyForecast({ weather, tempUnit = 'C' }) {
  const daily = weather?.daily
  if (!daily || !daily.time) return null

  const formatTemp = (celsius) => {
    if (celsius === null || celsius === undefined) return 0
    const val = tempUnit === 'F' ? celsius * 1.8 + 32 : celsius
    return Math.round(val)
  }

  const days = daily.time.map((dateStr, idx) => {
    const date = new Date(dateStr)
    const isToday = idx === 0
    const isTomorrow = idx === 1

    let dayLabel = date.toLocaleDateString('ko-KR', { weekday: 'short' })
    if (isToday) dayLabel = '오늘'
    else if (isTomorrow) dayLabel = '내일'

    const dateNum = `${date.getMonth() + 1}.${date.getDate()}`
    const code = daily.weather_code?.[idx]
    const meta = getWeatherInfo(code)
    const maxTemp = formatTemp(daily.temperature_2m_max?.[idx])
    const minTemp = formatTemp(daily.temperature_2m_min?.[idx])
    const precipProb = daily.precipitation_probability_max?.[idx] ?? 0

    return {
      dateStr,
      dayLabel,
      dateNum,
      meta,
      maxTemp,
      minTemp,
      precipProb,
      isToday,
    }
  })

  return (
    <article className="card weekly-card">
      <div className="card-header">
        <div>
          <span className="card-tag">주간 기상 예보</span>
          <h2 className="city-title">향후 7일간 일기예보 (°{tempUnit})</h2>
        </div>
        <div className="chart-legend">
          <Calendar size={16} />
          <span>7일간 전망</span>
        </div>
      </div>

      <div className="weekly-list">
        {days.map((d, idx) => (
          <div
            key={d.dateStr || idx}
            className={`weekly-item ${d.isToday ? 'is-today' : ''}`}
          >
            <div className="weekly-date-group">
              <span className="weekly-day">{d.dayLabel}</span>
              <span className="weekly-date">{d.dateNum}</span>
            </div>

            <div className="weekly-weather-info">
              <WeatherIcon
                name={d.meta?.icon}
                size={28}
                color={d.meta?.color || '#3b82f6'}
              />
              <span className="weekly-weather-label">{d.meta?.label}</span>
            </div>

            <div className="weekly-precip">
              {d.precipProb > 0 ? (
                <>
                  <Droplets size={14} className="precip-icon" />
                  <span>{d.precipProb}%</span>
                </>
              ) : (
                <span className="precip-none">-</span>
              )}
            </div>

            <div className="weekly-temp-range">
              <span className="temp-min">{d.minTemp}°</span>
              <div className="temp-bar-track">
                <div
                  className="temp-bar-fill"
                  style={{
                    marginLeft: `${Math.max(0, Math.min(60, (d.minTemp) * 1.5))}%`,
                    width: `${Math.max(25, Math.min(80, (d.maxTemp - d.minTemp) * 5))}%`,
                  }}
                ></div>
              </div>
              <span className="temp-max">{d.maxTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
