import { Activity } from 'lucide-react'

export default function AirQualityCard({ currentAQ, aqStatus }) {
  if (!currentAQ || !aqStatus) return null

  return (
    <article className="card air-card">
      <div className="card-header">
        <span className="card-badge">대기질 지수</span>
        <span
          className="aqi-status-badge"
          style={{ backgroundColor: aqStatus.badgeColor, color: '#fff' }}
        >
          {aqStatus.status}
        </span>
      </div>

      <div className="air-main">
        <div className="air-summary">
          <Activity size={32} color={aqStatus.badgeColor} />
          <div>
            <span className="air-summary-title">통합 대기 상태</span>
            <strong className="air-summary-status" style={{ color: aqStatus.badgeColor }}>
              {aqStatus.status}
            </strong>
          </div>
        </div>
        {currentAQ.european_aqi !== undefined && (
          <div className="aqi-score">
            <span className="aqi-label">유럽 AQI</span>
            <span className="aqi-value">{Math.round(currentAQ.european_aqi)}</span>
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-info">
            <span className="metric-label">미세먼지 (PM10)</span>
            <span className="metric-val">
              {Math.round(currentAQ.pm10)} <small>µg/m³</small>
            </span>
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-info">
            <span className="metric-label">초미세먼지 (PM2.5)</span>
            <span className="metric-val">
              {Math.round(currentAQ.pm2_5)} <small>µg/m³</small>
            </span>
          </div>
        </div>
      </div>

      <div className="air-guide">
        <span className="guide-title">환경부 미세먼지 등급 기준</span>
        <div className="guide-bar">
          <span className="bar-step good">좋음</span>
          <span className="bar-step normal">보통</span>
          <span className="bar-step bad">나쁨</span>
          <span className="bar-step very-bad">매우나쁨</span>
        </div>
      </div>
    </article>
  )
}
