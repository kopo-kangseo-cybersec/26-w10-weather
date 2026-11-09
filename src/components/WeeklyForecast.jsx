import { useMemo } from 'react'
import { CalendarDays, Umbrella } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export default function WeeklyForecast({ weather }) {
  const dailyData = useMemo(() => {
    if (!weather?.daily?.time) return []

    const {
      time,
      weather_code,
      temperature_2m_max,
      temperature_2m_min,
      precipitation_probability_max,
    } = weather.daily

    const todayDateStr = new Date().toISOString().slice(0, 10)

    return time.slice(0, 7).map((dateStr, idx) => {
      const dateObj = new Date(dateStr)
      const dayOfWeek = DAY_NAMES[dateObj.getDay()]
      const isToday = dateStr === todayDateStr

      return {
        dateStr,
        dayLabel: isToday ? '오늘' : idx === 1 ? '내일' : `${dayOfWeek}요일`,
        shortDate: `${dateObj.getMonth() + 1}.${dateObj.getDate()}`,
        code: weather_code ? weather_code[idx] : 0,
        maxTemp: Math.round(temperature_2m_max[idx]),
        minTemp: Math.round(temperature_2m_min[idx]),
        precipProb: precipitation_probability_max ? precipitation_probability_max[idx] : 0,
      }
    })
  }, [weather])

  if (dailyData.length === 0) return null

  // 7일 전체 중 최저/최고 기온을 기준으로 범위 바 계산
  const allMins = dailyData.map((d) => d.minTemp)
  const allMaxs = dailyData.map((d) => d.maxTemp)
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const globalRange = globalMax - globalMin || 1

  return (
    <article className="card weekly-card">
      <div className="card-header">
        <div className="card-title-group">
          <CalendarDays size={18} className="card-header-icon" />
          <span className="card-tag">7일간 주간 예보</span>
        </div>
        <span className="weekly-desc-info">향후 1주일 기상 전망</span>
      </div>

      <div className="weekly-list">
        {dailyData.map((day) => {
          const info = getWeatherInfo(day.code)
          // 최저~최고 기온 막대의 시작 위치(%)와 너비(%) 계산
          const leftPct = ((day.minTemp - globalMin) / globalRange) * 100
          const widthPct = Math.max(((day.maxTemp - day.minTemp) / globalRange) * 100, 8)

          return (
            <div key={day.dateStr} className="weekly-row">
              {/* 날짜 및 요일 */}
              <div className="weekly-day-col">
                <span className="weekly-day-label">{day.dayLabel}</span>
                <span className="weekly-date-sub">{day.shortDate}</span>
              </div>

              {/* 날씨 상태 아이콘 및 라벨 */}
              <div className="weekly-status-col">
                <WeatherIcon iconName={info.icon} size={24} color={info.color} />
                <span className="weekly-status-text">{info.label}</span>
              </div>

              {/* 강수 확률 */}
              <div className="weekly-rain-col">
                {day.precipProb > 0 ? (
                  <span className="rain-prob">
                    <Umbrella size={13} />
                    {day.precipProb}%
                  </span>
                ) : (
                  <span className="rain-zero">-</span>
                )}
              </div>

              {/* 최저 / 최고 기온 범위 바 */}
              <div className="weekly-temp-range-col">
                <span className="temp-min">{day.minTemp}°</span>
                <div className="temp-bar-track">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>
                <span className="temp-max">{day.maxTemp}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

