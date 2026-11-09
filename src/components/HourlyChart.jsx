import { useMemo } from 'react'
import { Clock } from 'lucide-react'

export default function HourlyChart({ weather, tempUnit = 'C' }) {
  const hourly = weather?.hourly

  // 오늘 하루 24시간 데이터 파싱 (0시~23시)
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.temperature_2m) return []

    const count = Math.min(24, hourly.time.length)
    const list = []

    for (let i = 0; i < count; i++) {
      const timeStr = hourly.time[i]
      const celsius = hourly.temperature_2m[i]
      const val = tempUnit === 'F' ? celsius * 1.8 + 32 : celsius
      const date = new Date(timeStr)
      const hour = date.getHours()

      list.push({
        time: timeStr,
        hourText: `${String(hour).padStart(2, '0')}:00`,
        hour,
        temp: Math.round(val * 10) / 10,
      })
    }
    return list
  }, [hourly, tempUnit])

  if (!chartData.length) return null

  // 차트 크기 및 스케일 계산
  const width = 800
  const height = 180
  const padding = { top: 35, right: 30, bottom: 40, left: 30 }

  const temps = chartData.map((d) => d.temp)
  const minTemp = Math.min(...temps) - 1.5
  const maxTemp = Math.max(...temps) + 1.5
  const tempRange = maxTemp - minTemp || 1

  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  // 좌표 계산
  const points = chartData.map((d, idx) => {
    const x = padding.left + (idx / (chartData.length - 1)) * innerWidth
    const y = padding.top + (1 - (d.temp - minTemp) / tempRange) * innerHeight
    return { ...d, x, y }
  })

  // SVG 패스 생성
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${padding.left},${height - padding.bottom} ${polylinePoints} ${
    padding.left + innerWidth
  },${height - padding.bottom}`

  // 현재 시간 구하기
  const currentHour = new Date().getHours()

  return (
    <article className="card hourly-card">
      <div className="card-header">
        <div>
          <span className="card-tag">시간대별 기상 예보</span>
          <h2 className="city-title">오늘 24시간 기온 추이 (°{tempUnit})</h2>
        </div>
        <div className="chart-legend">
          <Clock size={16} />
          <span>오늘 (00:00 ~ 23:00)</span>
        </div>
      </div>

      <div className="chart-scroll-wrapper">
        <div className="svg-container" style={{ minWidth: `${width}px` }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="hourly-svg" role="img" aria-label="오늘 24시간 기온 꺾은선 차트">
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 배경 보조 가이드 수평선 */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left + innerWidth}
              y2={padding.top}
              stroke="var(--border)"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <line
              x1={padding.left}
              y1={padding.top + innerHeight / 2}
              x2={padding.left + innerWidth}
              y2={padding.top + innerHeight / 2}
              stroke="var(--border)"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={padding.left + innerWidth}
              y2={height - padding.bottom}
              stroke="var(--border)"
              opacity="0.8"
            />

            {/* 그라데이션 면적 */}
            <polygon points={areaPoints} fill="url(#tempGradient)" />

            {/* 꺾은선 */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 각 데이터 포인트 및 레이블 */}
            {points.map((p, idx) => {
              const isNow = p.hour === currentHour
              return (
                <g key={idx} className={`chart-point-group ${isNow ? 'is-current' : ''}`}>
                  {/* 현재 시각 수직선 */}
                  {isNow && (
                    <line
                      x1={p.x}
                      y1={padding.top - 10}
                      x2={p.x}
                      y2={height - padding.bottom}
                      stroke="#2563eb"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* 포인트 점 */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isNow ? 5.5 : 3.5}
                    fill={isNow ? '#2563eb' : '#ffffff'}
                    stroke={isNow ? '#ffffff' : '#0284c7'}
                    strokeWidth={isNow ? 2.5 : 2}
                  />

                  {/* 기온 레이블 */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="chart-temp-text"
                    fill={isNow ? '#0284c7' : 'var(--text-h)'}
                    fontWeight={isNow ? '700' : '500'}
                    fontSize="12"
                  >
                    {Math.round(p.temp)}°
                  </text>

                  {/* 시간 레이블 */}
                  {(p.hour % 3 === 0 || isNow) && (
                    <text
                      x={p.x}
                      y={height - padding.bottom + 22}
                      textAnchor="middle"
                      className="chart-time-text"
                      fill={isNow ? '#0284c7' : 'var(--text)'}
                      fontWeight={isNow ? '700' : '400'}
                      fontSize="11"
                    >
                      {p.hourText}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </article>
  )
}
