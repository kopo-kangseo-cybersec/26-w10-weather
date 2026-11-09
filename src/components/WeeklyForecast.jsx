import { useMemo } from 'react'
import { CalendarDays, Umbrella } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export default function WeeklyForecast({ weather, unit = 'C', convertTemp }) {
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

      const rawMax = temperature_2m_max[idx]
      const rawMin = temperature_2m_min[idx]

      const maxTemp = convertTemp ? convertTemp(rawMax) : Math.round(rawMax)
      const minTemp = convertTemp ? convertTemp(rawMin) : Math.round(rawMin)

      return {
        dateStr,
        dayLabel: isToday ? 'TODAY' : idx === 1 ? 'TMRW' : dayOfWeek,
        shortDate: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
        code: weather_code ? weather_code[idx] : 0,
        maxTemp,
        minTemp,
        precipProb: precipitation_probability_max ? precipitation_probability_max[idx] : 0,
      }
    })
  }, [weather, convertTemp])

  if (dailyData.length === 0) return null

  const allMins = dailyData.map((d) => d.minTemp)
  const allMaxs = dailyData.map((d) => d.maxTemp)
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const globalRange = globalMax - globalMin || 1

  return (
    <article className="card weekly-card retro-window">
      <div className="retro-titlebar">
        <span className="title-text">WEEKLY_FORECAST.TXT</span>
        <div className="titlebar-controls">
          <span className="win-btn">_</span>
          <span className="win-btn">■</span>
          <span className="win-btn">X</span>
        </div>
      </div>

      <div className="card-header retro-card-header">
        <div className="card-title-group">
          <CalendarDays size={16} className="card-header-icon" />
          <span className="card-tag">[7-DAY_WEATHER_OUTLOOK]</span>
        </div>
        <span className="weekly-desc-info retro-code">STATUS: OK</span>
      </div>

      <div className="weekly-list retro-list">
        {dailyData.map((day) => {
          const info = getWeatherInfo(day.code)
          const leftPct = ((day.minTemp - globalMin) / globalRange) * 100
          const widthPct = Math.max(((day.maxTemp - day.minTemp) / globalRange) * 100, 10)

          return (
            <div key={day.dateStr} className="weekly-row retro-row">
              <div className="weekly-day-col">
                <span className="weekly-day-label retro-code">{day.dayLabel}</span>
                <span className="weekly-date-sub">{day.shortDate}</span>
              </div>

              <div className="weekly-status-col">
                <WeatherIcon iconName={info.icon} size={16} color={info.color} />
                <span className="weekly-status-text retro-code">{info.label}</span>
              </div>

              <div className="weekly-rain-col">
                {day.precipProb > 0 ? (
                  <span className="rain-prob retro-code">
                    <Umbrella size={16} />
                    {day.precipProb}%
                  </span>
                ) : (
                  <span className="rain-zero">-</span>
                )}
              </div>

              <div className="weekly-temp-range-col">
                <span className="temp-min retro-code">{day.minTemp}°</span>
                <div className="temp-bar-track retro-track">
                  <div
                    className="temp-bar-fill retro-fill"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>
                <span className="temp-max retro-code">{day.maxTemp}°{unit}</span>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
