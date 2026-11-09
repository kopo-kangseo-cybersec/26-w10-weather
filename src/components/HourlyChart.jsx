import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export default function HourlyChart({ weather }) {
  const hourlyData = useMemo(() => {
    if (!weather?.hourly?.time || !weather?.hourly?.temperature_2m) return []

    const now = new Date()
    const times = weather.hourly.time
    const temps = weather.hourly.temperature_2m
    const codes = weather.hourly.weather_code || []

    // 현재 시간과 가장 가까운 인덱스 찾기
    let startIndex = 0
    const nowIsoPrefix = now.toISOString().slice(0, 13) // "YYYY-MM-DDTHH"
    const foundIndex = times.findIndex((t) => t.startsWith(nowIsoPrefix))
    if (foundIndex !== -1) {
      startIndex = foundIndex
    }

    // 향후 24시간 슬라이스
    const sliceCount = 24
    const result = []
    for (let i = 0; i < sliceCount && startIndex + i < times.length; i++) {
      const idx = startIndex + i
      const timeStr = times[idx]
      const hour = new Date(timeStr).getHours()
      const isNight = hour < 6 || hour >= 19
      const code = codes[idx]
      const baseInfo = getWeatherInfo(code)

      // 야간(19시~06시) 시 맑음/구름조금일 경우 햇살 대신 달(Moon) 아이콘 적용
      let displayIcon = baseInfo.icon
      let displayColor = baseInfo.color

      if (isNight) {
        if (code === 0 || code === 1) {
          displayIcon = 'Moon'
          displayColor = '#818cf8' // 차분한 보라/남색
        } else if (code === 2) {
          displayIcon = 'CloudMoon'
          displayColor = '#94a3b8'
        }
      }

      result.push({
        time: timeStr,
        hourLabel: i === 0 ? '지금' : `${hour}시`,
        temp: Math.round(temps[idx]),
        exactTemp: temps[idx],
        code,
        icon: displayIcon,
        color: displayColor,
        isNight,
      })
    }
    return result
  }, [weather])

  if (hourlyData.length === 0) return null

  // 차트 크기 및 좌표 계산
  const pointWidth = 58
  const chartHeight = 150
  const paddingTop = 36
  const paddingBottom = 30
  const chartWidth = Math.max(hourlyData.length * pointWidth, 600)

  const temps = hourlyData.map((d) => d.exactTemp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp - minTemp || 1

  const points = hourlyData.map((d, i) => {
    const x = i * pointWidth + pointWidth / 2
    const normalized = (d.exactTemp - minTemp) / tempRange
    const y = chartHeight - paddingBottom - normalized * (chartHeight - paddingTop - paddingBottom)
    return { ...d, x, y }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  // 부드러운 그라데이션 영역을 위한 path d 생성
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const areaPath = `M ${firstPoint.x},${chartHeight - 10} L ${polylinePoints} L ${lastPoint.x},${chartHeight - 10} Z`

  return (
    <article className="card hourly-card">
      <div className="card-header">
        <div className="card-title-group">
          <Clock size={18} className="card-header-icon" />
          <span className="card-tag">24시간 기온 예보</span>
        </div>
        <span className="hourly-range-info">
          최저 {Math.round(minTemp)}°C / 최고 {Math.round(maxTemp)}°C
        </span>
      </div>

      {/* 가로 스크롤 래퍼: SVG와 아이콘/라벨이 일체형으로 스크롤됨 */}
      <div className="hourly-chart-scroll-wrapper">
        <div className="hourly-chart-inner" style={{ width: chartWidth }}>
          {/* 상단 날씨 아이콘 행 (차트 포인트와 1:1 정렬) */}
          <div className="hourly-icons-row" style={{ width: chartWidth }}>
            {points.map((p) => (
              <div
                key={`icon-${p.time}`}
                className="hourly-icon-col"
                style={{ width: pointWidth }}
                title={`${p.hourLabel} 날씨`}
              >
                <WeatherIcon iconName={p.icon} size={20} color={p.color} />
              </div>
            ))}
          </div>

          {/* SVG 꺾은선 차트 */}
          <svg
            className="hourly-svg-chart"
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 배경 그라데이션 영역 */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* 꺾은선 */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />

            {/* 각 포인트 점, 기온 수치, 시간 라벨 */}
            {points.map((p, i) => (
              <g key={p.time} className="chart-point-group">
                {/* 수직 보조선 */}
                <line
                  x1={p.x}
                  y1={chartHeight - 22}
                  x2={p.x}
                  y2={chartHeight - 16}
                  stroke="var(--border)"
                  strokeWidth="1"
                />

                {/* 포인트 점 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={i === 0 ? 5 : 4}
                  fill={i === 0 ? '#2563eb' : '#ffffff'}
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />

                {/* 기온 텍스트 */}
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="chart-temp-text"
                  fill="var(--text-h)"
                  fontSize="13"
                  fontWeight="700"
                >
                  {p.temp}°
                </text>

                {/* 시간 라벨 */}
                <text
                  x={p.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="chart-hour-text"
                  fill={i === 0 ? '#2563eb' : 'var(--text)'}
                  fontSize="12"
                  fontWeight={i === 0 ? '700' : '500'}
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
