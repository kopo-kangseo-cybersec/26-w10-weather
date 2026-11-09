import { Activity } from 'lucide-react'

export default function AirQualityCard({ currentAQ, aqStatus }) {
  if (!currentAQ) return null

  return (
    <section className="card air-quality-card">
      <div className="card-header">
        <span className="card-badge">공기질 (환경부 기준)</span>
        <span
          className="status-badge"
          style={{
            backgroundColor: aqStatus?.badgeColor,
            color: '#ffffff',
          }}
        >
          {aqStatus?.status}
        </span>
      </div>

      <div className="aqi-main-status">
        <Activity size={32} style={{ color: aqStatus?.badgeColor }} />
        <div className="aqi-overview">
          <h3>통합 대기질: <strong>{aqStatus?.status}</strong></h3>
          <p>실외 활동 시 환경부 대기질 지표를 참고하세요.</p>
        </div>
      </div>

      <div className="aqi-metrics-grid">
        {/* PM10 미세먼지 */}
        <div className="aqi-metric-box">
          <div className="metric-header">
            <span className="metric-name">미세먼지 (PM10)</span>
            <span className="metric-value">
              {Math.round(currentAQ.pm10)} <small>μg/m³</small>
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, (currentAQ.pm10 / 150) * 100)}%`,
                backgroundColor:
                  currentAQ.pm10 > 150
                    ? '#ef4444'
                    : currentAQ.pm10 > 80
                    ? '#f97316'
                    : currentAQ.pm10 > 30
                    ? '#3b82f6'
                    : '#10b981',
              }}
            ></div>
          </div>
          <div className="range-guide">
            <span>좋음 0~30</span>
            <span>보통 ~80</span>
            <span>나쁨 ~150</span>
            <span>매우나쁨 151+</span>
          </div>
        </div>

        {/* PM2.5 초미세먼지 */}
        <div className="aqi-metric-box">
          <div className="metric-header">
            <span className="metric-name">초미세먼지 (PM2.5)</span>
            <span className="metric-value">
              {Math.round(currentAQ.pm2_5)} <small>μg/m³</small>
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, (currentAQ.pm2_5 / 75) * 100)}%`,
                backgroundColor:
                  currentAQ.pm2_5 > 75
                    ? '#ef4444'
                    : currentAQ.pm2_5 > 35
                    ? '#f97316'
                    : currentAQ.pm2_5 > 15
                    ? '#3b82f6'
                    : '#10b981',
              }}
            ></div>
          </div>
          <div className="range-guide">
            <span>좋음 0~15</span>
            <span>보통 ~35</span>
            <span>나쁨 ~75</span>
            <span>매우나쁨 76+</span>
          </div>
        </div>
      </div>
    </section>
  )
}

