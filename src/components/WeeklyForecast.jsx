import { Calendar, Droplets } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time || daily.time.length === 0) return null

  // 7일간 전체 최저/최고 기온 계산 (온도 바 정규화용)
  const minTemps = daily.temperature_2m_min.map((t) => Math.round(t))
  const maxTemps = daily.temperature_2m_max.map((t) => Math.round(t))
  const globalMin = Math.min(...minTemps)
  const globalMax = Math.max(...maxTemps)
  const tempRange = globalMax - globalMin || 1

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

  const forecastDays = daily.time.map((dateStr, idx) => {
    const date = new Date(dateStr)
    const isToday = idx === 0
    const dayLabel = isToday ? '오늘' : `${daysOfWeek[date.getDay()]}요일`
    const dateFormatted = `${date.getMonth() + 1}.${date.getDate()}`
    const minTemp = minTemps[idx]
    const maxTemp = maxTemps[idx]
    const weatherCode = daily.weather_code[idx]
    const info = getWeatherInfo(weatherCode)
    const pop = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0

    // 온도 막대 위치 계산
    const leftPercent = Math.max(0, Math.min(100, ((minTemp - globalMin) / tempRange) * 100))
    const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((maxTemp - minTemp) / tempRange) * 100))

    return {
      dateStr,
      dayLabel,
      dateFormatted,
      isToday,
      minTemp,
      maxTemp,
      info,
      pop,
      leftPercent,
      widthPercent,
    }
  })

  return (
    <section className="card weekly-forecast-card">
      <div className="card-header">
        <span className="card-badge">7일간 주간 예보</span>
        <span className="forecast-meta">
          <Calendar size={14} />
          주간 일기예보
        </span>
      </div>

      <div className="weekly-list">
        {forecastDays.map((day) => (
          <div key={day.dateStr} className={`weekly-item ${day.isToday ? 'today' : ''}`}>
            {/* 요일 및 날짜 */}
            <div className="day-col">
              <span className="day-name">{day.dayLabel}</span>
              <span className="day-date">{day.dateFormatted}</span>
            </div>

            {/* 날씨 아이콘 & 상태 */}
            <div className="weather-col">
              <WeatherIcon iconName={day.info.icon} size={22} color={day.info.color} />
              <span className="weather-label">{day.info.label}</span>
              {day.pop > 0 && (
                <span className="pop-badge" title={`강수 확률 ${day.pop}%`}>
                  <Droplets size={11} />
                  {day.pop}%
                </span>
              )}
            </div>

            {/* 최저 / 최고 기온 및 비주얼 바 */}
            <div className="temp-range-col">
              <span className="min-temp">{day.minTemp}°</span>
              <div className="temp-bar-bg">
                <div
                  className="temp-bar-fill"
                  style={{
                    left: `${day.leftPercent}%`,
                    width: `${day.widthPercent}%`,
                  }}
                ></div>
              </div>
              <span className="max-temp">{day.maxTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

