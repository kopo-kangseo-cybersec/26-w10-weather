import { Activity } from 'lucide-react'
import { getAirQualityStatus } from '../api/weather'

export default function AirQualityCard({ airQuality }) {
  const currentAir = airQuality?.current
  const pm10Value = currentAir?.pm10 ?? null
  const pm25Value = currentAir?.pm2_5 ?? null

  const airStatus = (pm10Value !== null && pm25Value !== null)
    ? getAirQualityStatus(pm10Value, pm25Value)
    : null

  const getPm10Grade = (val) => {
    if (val === null || val === undefined) return { label: '-', color: '#94a3b8' }
    if (val <= 30) return { label: '좋음', color: '#10b981' }
    if (val <= 80) return { label: '보통', color: '#3b82f6' }
    if (val <= 150) return { label: '나쁨', color: '#f97316' }
    return { label: '매우 나쁨', color: '#ef4444' }
  }

  const getPm25Grade = (val) => {
    if (val === null || val === undefined) return { label: '-', color: '#94a3b8' }
    if (val <= 15) return { label: '좋음', color: '#10b981' }
    if (val <= 35) return { label: '보통', color: '#3b82f6' }
    if (val <= 75) return { label: '나쁨', color: '#f97316' }
    return { label: '매우 나쁨', color: '#ef4444' }
  }

  const pm10Grade = getPm10Grade(pm10Value)
  const pm25Grade = getPm25Grade(pm25Value)

  return (
    <article className="card air-card">
      <div className="card-header">
        <div>
          <span className="card-tag">대기질 지수</span>
          <h2 className="city-title">환경부 기준 대기질</h2>
        </div>
        {airStatus && (
          <div
            className="air-status-badge"
            style={{ backgroundColor: airStatus.badgeColor }}
          >
            <Activity size={16} />
            <span>{airStatus.status}</span>
          </div>
        )}
      </div>

      <div className="air-summary">
        <div className="air-overall">
          <span className="air-label">통합 대기질 상태</span>
          <strong
            className="air-grade-text"
            style={{ color: airStatus?.badgeColor || 'inherit' }}
          >
            {airStatus ? airStatus.status : '측정 정보 없음'}
          </strong>
        </div>
      </div>

      <div className="air-pollutants-list">
        {/* PM10 */}
        <div className="pollutant-box">
          <div className="pollutant-top">
            <div>
              <span className="pollutant-name">미세먼지 (PM10)</span>
              <span className="pollutant-standard">기준: 0~30 좋음 / 31~80 보통</span>
            </div>
            <span
              className="grade-chip"
              style={{
                backgroundColor: `${pm10Grade.color}20`,
                color: pm10Grade.color,
                borderColor: pm10Grade.color,
              }}
            >
              {pm10Grade.label}
            </span>
          </div>
          <div className="pollutant-val">
            <strong>{pm10Value !== null ? Math.round(pm10Value) : '-'}</strong>
            <span className="unit">μg/m³</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, ((pm10Value || 0) / 150) * 100)}%`,
                backgroundColor: pm10Grade.color,
              }}
            ></div>
          </div>
        </div>

        {/* PM2.5 */}
        <div className="pollutant-box">
          <div className="pollutant-top">
            <div>
              <span className="pollutant-name">초미세먼지 (PM2.5)</span>
              <span className="pollutant-standard">기준: 0~15 좋음 / 16~35 보통</span>
            </div>
            <span
              className="grade-chip"
              style={{
                backgroundColor: `${pm25Grade.color}20`,
                color: pm25Grade.color,
                borderColor: pm25Grade.color,
              }}
            >
              {pm25Grade.label}
            </span>
          </div>
          <div className="pollutant-val">
            <strong>{pm25Value !== null ? Math.round(pm25Value) : '-'}</strong>
            <span className="unit">μg/m³</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, ((pm25Value || 0) / 75) * 100)}%`,
                backgroundColor: pm25Grade.color,
              }}
            ></div>
          </div>
        </div>
      </div>
    </article>
  )
}

