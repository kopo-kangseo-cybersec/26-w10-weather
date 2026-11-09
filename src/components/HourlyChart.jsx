import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function HourlyChart({ hourly, referenceDate = null }) {
  // 기준 시각(또는 첫 데이터 시각) 기준 향후 24시간 슬라이스
  const hoursData = useMemo(() => {
    if (!hourly || !hourly.time || hourly.time.length === 0) return []

    const ref = referenceDate instanceof Date ? referenceDate : null
    let startIndex = 0

    if (ref) {
      const year = ref.getFullYear()
      const month = String(ref.getMonth() + 1).padStart(2, '0')
      const day = String(ref.getDate()).padStart(2, '0')
      const hour = String(ref.getHours()).padStart(2, '0')
      const currentHourStr = `${year}-${month}-${day}T${hour}`
      const foundIdx = hourly.time.findIndex((t) => t.startsWith(currentHourStr))
      if (foundIdx !== -1) {
        startIndex = foundIdx
      }
    }

    return hourly.time.slice(startIndex, startIndex + 24).map((timeStr, i) => {
      const idx = startIndex + i
      // timeStr은 "YYYY-MM-DDTHH:MM" 형태이므로 문자열에서 직접 시간 파싱
      const hourPart = timeStr.includes('T') ? parseInt(timeStr.split('T')[1].slice(0, 2), 10) : i
      const temp = Math.round(hourly.temperature_2m[idx])
      const code = hourly.weather_code[idx]
      const info = getWeatherInfo(code)
      return {
        time: timeStr,
        hourLabel: i === 0 ? '지금' : `${hourPart}시`,
        isNow: i === 0,
        temp,
        info,
      }
    })
  }, [hourly, referenceDate])

  if (!hourly || !hourly.time || hourly.time.length === 0 || hoursData.length === 0) return null

  const temps = hoursData.map((d) => d.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp - minTemp || 1

  // SVG 차트 좌표 계산
  const width = Math.max(760, hoursData.length * 36)
  const height = 150
  const paddingTop = 42
  const paddingBottom = 34
  const paddingX = 24
  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingTop - paddingBottom
  const stepX = usableWidth / (hoursData.length - 1)

  const points = hoursData.map((d, i) => {
    const x = paddingX + i * stepX
    const y = paddingTop + ((maxTemp - d.temp) / tempRange) * usableHeight
    return { ...d, x, y }
  })

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaString = `${points[0].x},${height - paddingBottom + 10} ${pointsString} ${points[points.length - 1].x},${height - paddingBottom + 10}`

  return (
    <section className="card hourly-chart-card">
      <div className="card-header">
        <span className="card-badge">24시간 시간별 기온 예보</span>
        <span className="hourly-meta">
          <Clock size={14} />
          향후 24시간 추이
        </span>
      </div>

      <div className="chart-scroll-wrapper">
        <div className="chart-inner" style={{ minWidth: `${width}px` }}>
          {/* 상단 미니 날씨 아이콘 */}
          <div className="hourly-icons-row" style={{ paddingLeft: `${paddingX - 12}px`, paddingRight: `${paddingX - 12}px` }}>
            {points.map((p, idx) => (
              <div
                key={p.time || idx}
                className="hourly-icon-col"
                style={{ width: `${stepX}px` }}
                title={`${p.hourLabel}: ${p.info.label} (${p.temp}°C)`}
              >
                <WeatherIcon
                  iconName={p.info.icon}
                  size={18}
                  color={p.info.color}
                />
              </div>
            ))}
          </div>

          {/* SVG 꺾은선 & 영역 차트 */}
          <svg
            className="hourly-svg"
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
          >
            <defs>
              <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 영역 채우기 */}
            <polygon points={areaString} fill="url(#hourlyTempGrad)" />

            {/* 메인 꺾은선 */}
            <polyline
              points={pointsString}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 데이터 포인트 & 텍스트 라벨 */}
            {points.map((p, idx) => (
              <g key={p.time || idx}>
                {/* 수직 가이드 점선 (지금인 경우 강조) */}
                {p.isNow && (
                  <line
                    x1={p.x}
                    y1={paddingTop - 15}
                    x2={p.x}
                    y2={height - paddingBottom + 5}
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                )}

                {/* 포인트 점 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.isNow ? 5 : 3.5}
                  fill={p.isNow ? 'var(--accent)' : 'var(--bg)'}
                  stroke="var(--accent)"
                  strokeWidth={p.isNow ? 2 : 2}
                />

                {/* 온도 텍스트 */}
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className={`chart-temp-label ${p.isNow ? 'now' : ''}`}
                >
                  {p.temp}°
                </text>

                {/* 시간 라벨 */}
                <text
                  x={p.x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`chart-hour-label ${p.isNow ? 'now' : ''}`}
                >
                  {p.hourLabel}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}

