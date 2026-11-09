import { getAirQualityStatus } from '../api/weather'

export default function AirQualityCard({ city, airQuality }) {
  const current = airQuality?.current
  if (!current) return null

  const { status, badgeColor } = getAirQualityStatus(current.pm10, current.pm2_5)

  return (
    <article className="card air-quality-card">
      <div className="card-header">
        <span className="card-tag">대기질 지표</span>
        <span
          className="air-status-badge"
          style={{ backgroundColor: badgeColor }}
        >
          {status}
        </span>
      </div>

      <div className="air-summary-box">
        <p className="air-guide-text">
          한국 환경부 기준에 따른 <strong>{city.name}</strong> 대기 상태입니다.
        </p>
      </div>

      <div className="air-metrics-grid">
        {/* 미세먼지 (PM10) */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">미세먼지 (PM10)</span>
            <span className="metric-grade">
              {current.pm10 <= 30
                ? '좋음'
                : current.pm10 <= 80
                ? '보통'
                : current.pm10 <= 150
                ? '나쁨'
                : '매우 나쁨'}
            </span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{Math.round(current.pm10)}</span>
            <span className="metric-unit">µg/m³</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min((current.pm10 / 160) * 100, 100)}%`,
                backgroundColor:
                  current.pm10 <= 30
                    ? '#10b981'
                    : current.pm10 <= 80
                    ? '#3b82f6'
                    : current.pm10 <= 150
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* 초미세먼지 (PM2.5) */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-title">초미세먼지 (PM2.5)</span>
            <span className="metric-grade">
              {current.pm2_5 <= 15
                ? '좋음'
                : current.pm2_5 <= 35
                ? '보통'
                : current.pm2_5 <= 75
                ? '나쁨'
                : '매우 나쁨'}
            </span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{Math.round(current.pm2_5)}</span>
            <span className="metric-unit">µg/m³</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min((current.pm2_5 / 80) * 100, 100)}%`,
                backgroundColor:
                  current.pm2_5 <= 15
                    ? '#10b981'
                    : current.pm2_5 <= 35
                    ? '#3b82f6'
                    : current.pm2_5 <= 75
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

