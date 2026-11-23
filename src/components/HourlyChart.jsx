import { useMemo } from 'react'
import { Clock } from 'lucide-react'

export default function HourlyChart({ hourly, currentTime }) {
  // Open-Meteo API 응답의 current.time을 기준으로 순수하게 24시간 슬라이스
  const startIndex = useMemo(() => {
    if (!hourly?.time) return 0
    if (!currentTime) return 0
    const hourPrefix = currentTime.slice(0, 13) // 예: "2026-11-23T15"
    const idx = hourly.time.findIndex((t) => t.startsWith(hourPrefix))
    return idx !== -1 ? idx : 0
  }, [hourly, currentTime])

  if (!hourly || !hourly.time || !hourly.temperature_2m) return null

  const times = hourly.time.slice(startIndex, startIndex + 24)
  const temps = hourly.temperature_2m.slice(startIndex, startIndex + 24)

  if (!times.length || !temps.length) return null

  const minTemp = Math.floor(Math.min(...temps)) - 2
  const maxTemp = Math.ceil(Math.max(...temps)) + 2
  const tempRange = maxTemp - minTemp || 1

  // SVG 차트 좌표 계산
  const width = 760
  const height = 150
  const paddingTop = 32
  const paddingBottom = 34
  const paddingLeft = 24
  const paddingRight = 24
  const plotWidth = width - paddingLeft - paddingRight
  const plotHeight = height - paddingTop - paddingBottom

  const stepX = plotWidth / (times.length - 1 || 1)

  const points = temps.map((temp, i) => {
    const x = paddingLeft + i * stepX
    const y = paddingTop + ((maxTemp - temp) / tempRange) * plotHeight
    return { x, y, temp, time: times[i] }
  })

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPoints = `${paddingLeft},${height - paddingBottom} ${polylinePoints} ${width - paddingRight},${height - paddingBottom}`

  return (
    <article className="card hourly-chart-card">
      <div className="card-header">
        <span className="card-badge">24시간 예보</span>
        <span className="location-name">
          <Clock size={16} /> 오늘~내일 시간대별 기온 변화
        </span>
      </div>

      <div className="chart-scroll-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="hourly-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 그라데이션 영역 채우기 */}
          <polygon points={areaPoints} fill="url(#chartGradient)" />

          {/* 꺾은선 */}
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* 데이터 포인트 및 텍스트 라벨 */}
          {points.map((p, idx) => {
            const hour = new Date(p.time).getHours()
            const timeLabel = idx === 0 ? '지금' : `${hour}시`
            const isHighlight = idx % 3 === 0 || idx === 0 // 3시간 간격 라벨 강조

            return (
              <g key={p.time}>
                {/* 데이터 점 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHighlight ? 4.5 : 3}
                  fill="var(--bg)"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />

                {/* 기온 표시 (3시간 간격 또는 첫 번째) */}
                {isHighlight && (
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="chart-temp-label"
                  >
                    {Math.round(p.temp)}°
                  </text>
                )}

                {/* 시간 표시 */}
                {isHighlight && (
                  <text
                    x={p.x}
                    y={height - 10}
                    textAnchor="middle"
                    className="chart-time-label"
                  >
                    {timeLabel}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </article>
  )
}
