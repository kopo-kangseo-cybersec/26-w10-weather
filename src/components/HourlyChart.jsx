import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function HourlyChart({ weather, unit = 'C', convertTemp }) {
  const hourlyData = useMemo(() => {
    if (!weather?.hourly?.time || !weather?.hourly?.temperature_2m) return []

    const now = new Date()
    const times = weather.hourly.time
    const temps = weather.hourly.temperature_2m
    const codes = weather.hourly.weather_code || []

    let startIndex = 0
    const nowIsoPrefix = now.toISOString().slice(0, 13)
    const foundIndex = times.findIndex((t) => t.startsWith(nowIsoPrefix))
    if (foundIndex !== -1) {
      startIndex = foundIndex
    }

    const sliceCount = 24
    const result = []
    for (let i = 0; i < sliceCount && startIndex + i < times.length; i++) {
      const idx = startIndex + i
      const timeStr = times[idx]
      const hour = new Date(timeStr).getHours()
      const isNight = hour < 6 || hour >= 19
      const code = codes[idx]
      const baseInfo = getWeatherInfo(code)

      let displayIcon = baseInfo.icon
      let displayColor = baseInfo.color

      if (isNight) {
        if (code === 0 || code === 1) {
          displayIcon = 'Moon'
          displayColor = '#818cf8'
        } else if (code === 2) {
          displayIcon = 'CloudMoon'
          displayColor = '#94a3b8'
        }
      }

      const rawTemp = temps[idx]
      const converted = convertTemp ? convertTemp(rawTemp) : Math.round(rawTemp)

      result.push({
        time: timeStr,
        hourLabel: i === 0 ? 'NOW' : `${hour}H`,
        temp: converted,
        rawTemp,
        code,
        icon: displayIcon,
        color: displayColor,
        isNight,
      })
    }
    return result
  }, [weather, convertTemp])

  if (hourlyData.length === 0) return null

  const pointWidth = 54
  const chartHeight = 140
  const paddingTop = 32
  const paddingBottom = 26
  const chartWidth = Math.max(hourlyData.length * pointWidth, 600)

  const temps = hourlyData.map((d) => d.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp - minTemp || 1

  const points = hourlyData.map((d, i) => {
    const x = i * pointWidth + pointWidth / 2
    const normalized = (d.temp - minTemp) / tempRange
    const y = chartHeight - paddingBottom - normalized * (chartHeight - paddingTop - paddingBottom)
    return { ...d, x, y }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const areaPath = `M ${firstPoint.x},${chartHeight - 8} L ${polylinePoints} L ${lastPoint.x},${chartHeight - 8} Z`

  return (
    <article className="card hourly-card retro-window">
      <div className="retro-titlebar">
        <span className="title-text">24H_CHART.SYS</span>
        <div className="titlebar-controls">
          <span className="win-btn">_</span>
          <span className="win-btn">■</span>
          <span className="win-btn">X</span>
        </div>
      </div>

      <div className="card-header retro-card-header">
        <div className="card-title-group">
          <Clock size={16} className="card-header-icon" />
          <span className="card-tag">[24-HOUR_TEMPERATURE_PLOT]</span>
        </div>
        <span className="hourly-range-info retro-code">
          MIN: {minTemp}°{unit} / MAX: {maxTemp}°{unit}
        </span>
      </div>

      <div className="hourly-chart-scroll-wrapper retro-scroll">
        <div className="hourly-chart-inner" style={{ width: chartWidth }}>
          {/* 상단 16px 날씨 아이콘 */}
          <div className="hourly-icons-row" style={{ width: chartWidth }}>
            {points.map((p) => (
              <div
                key={`icon-${p.time}`}
                className="hourly-icon-col"
                style={{ width: pointWidth }}
                title={`${p.hourLabel} 날씨`}
              >
                <WeatherIcon iconName={p.icon} size={16} color={p.color} />
              </div>
            ))}
          </div>

          {/* SVG 꺾은선 차트 (도스 터미널 스타일) */}
          <svg
            className="hourly-svg-chart retro-svg"
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <defs>
              <linearGradient id="retroChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff00" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00ff00" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 그리드 수평선 */}
            <line x1="0" y1={paddingTop} x2={chartWidth} y2={paddingTop} stroke="#404040" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight - paddingBottom} x2={chartWidth} y2={chartHeight - paddingBottom} stroke="#404040" strokeDasharray="3 3" />

            <path d={areaPath} fill="url(#retroChartGradient)" />

            <polyline
              fill="none"
              stroke="#00ff66"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              points={polylinePoints}
            />

            {points.map((p, i) => (
              <g key={p.time} className="chart-point-group">
                <rect
                  x={p.x - 3}
                  y={p.y - 3}
                  width="6"
                  height="6"
                  fill={i === 0 ? '#ffff00' : '#00ff66'}
                  stroke="#000000"
                  strokeWidth="1"
                />

                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  className="chart-temp-text"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {p.temp}°
                </text>

                <text
                  x={p.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="chart-hour-text"
                  fill={i === 0 ? '#ffff00' : '#aaaaaa'}
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {p.hourLabel}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </article>
  )
}
