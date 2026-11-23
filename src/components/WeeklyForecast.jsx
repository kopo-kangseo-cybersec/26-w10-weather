import { CalendarDays, Droplets } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time || !daily.weather_code) return null

  const items = daily.time.slice(0, 7).map((dateStr, i) => {
    const date = new Date(dateStr)
    const dayName = i === 0 ? '오늘' : i === 1 ? '내일' : `${DAYS_KO[date.getDay()]}요일`
    const formattedDate = `${date.getMonth() + 1}.${date.getDate()}`
    const weatherInfo = getWeatherInfo(daily.weather_code[i])
    const maxTemp = Math.round(daily.temperature_2m_max[i])
    const minTemp = Math.round(daily.temperature_2m_min[i])
    const precipProb = daily.precipitation_probability_max
      ? daily.precipitation_probability_max[i]
      : 0

    return {
      dateStr,
      dayName,
      formattedDate,
      weatherInfo,
      maxTemp,
      minTemp,
      precipProb,
    }
  })

  // 전체 주간 최저/최고값 (기온 막대 비율 계산용)
  const globalMin = Math.min(...items.map((it) => it.minTemp))
  const globalMax = Math.max(...items.map((it) => it.maxTemp))
  const globalRange = globalMax - globalMin || 1

  return (
    <article className="card weekly-card">
      <div className="card-header">
        <span className="card-badge">주간 예보</span>
        <span className="location-name">
          <CalendarDays size={16} /> 향후 7일간 일기예보
        </span>
      </div>

      <div className="weekly-list">
        {items.map((item) => {
          // 기온 막대 offset 및 width 백분율 계산
          const leftPercent = ((item.minTemp - globalMin) / globalRange) * 100
          const barWidthPercent = Math.max(
            ((item.maxTemp - item.minTemp) / globalRange) * 100,
            12
          )

          return (
            <div key={item.dateStr} className="weekly-item">
              <div className="weekly-day">
                <span className="day-name">{item.dayName}</span>
                <span className="date-sub">{item.formattedDate}</span>
              </div>

              <div className="weekly-weather-info">
                <WeatherIcon
                  name={item.weatherInfo.icon}
                  size={24}
                  color={item.weatherInfo.color}
                />
                <span className="weekly-weather-label">{item.weatherInfo.label}</span>
                {item.precipProb > 0 && (
                  <span className="precip-prob">
                    <Droplets size={12} /> {item.precipProb}%
                  </span>
                )}
              </div>

              <div className="weekly-temp-range">
                <span className="min-temp">{item.minTemp}°</span>
                <div className="temp-bar-bg">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                    }}
                  />
                </div>
                <span className="max-temp">{item.maxTemp}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
