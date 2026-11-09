import { getAirQualityStatus } from '../api/weather'

// 도스 텍스트 프로그레스 바 생성 헬퍼
function renderDosBar(value, max) {
  const totalBlocks = 12
  const filledCount = Math.min(Math.round((value / max) * totalBlocks), totalBlocks)
  const emptyCount = totalBlocks - filledCount
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount)
}

export default function AirQualityCard({ city, airQuality }) {
  const current = airQuality?.current
  if (!current) return null

  const { status, badgeColor } = getAirQualityStatus(current.pm10, current.pm2_5)

  return (
    <article className="card air-quality-card retro-window">
      <div className="retro-titlebar">
        <span className="title-text">AIR_QUALITY.COM</span>
        <div className="titlebar-controls">
          <span className="win-btn">_</span>
          <span className="win-btn">■</span>
          <span className="win-btn">X</span>
        </div>
      </div>

      <div className="card-header retro-card-header">
        <span className="card-tag">[AIR_POLLUTION_INDEX]</span>
        <span
          className="air-status-badge retro-badge"
          style={{ backgroundColor: badgeColor }}
        >
          {status}
        </span>
      </div>

      <div className="air-summary-box retro-summary">
        <p className="air-guide-text">
          &gt; 모니터링 구역: <strong>{city.name}</strong> [환경부 기준]
        </p>
      </div>

      <div className="air-metrics-grid retro-metrics">
        {/* 미세먼지 (PM10) */}
        <div className="metric-box retro-box">
          <div className="metric-header">
            <span className="metric-title">&gt; PM10 (미세먼지):</span>
            <span className="metric-grade">[{current.pm10 <= 30 ? 'GOOD' : current.pm10 <= 80 ? 'NORMAL' : current.pm10 <= 150 ? 'BAD' : 'CRITICAL'}]</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number retro-num">{Math.round(current.pm10)}</span>
            <span className="metric-unit">µg/m³</span>
          </div>
          <div className="dos-ascii-bar">
            [{renderDosBar(current.pm10, 160)}]
          </div>
        </div>

        {/* 초미세먼지 (PM2.5) */}
        <div className="metric-box retro-box">
          <div className="metric-header">
            <span className="metric-title">&gt; PM2.5 (초미세):</span>
            <span className="metric-grade">[{current.pm2_5 <= 15 ? 'GOOD' : current.pm2_5 <= 35 ? 'NORMAL' : current.pm2_5 <= 75 ? 'BAD' : 'CRITICAL'}]</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number retro-num">{Math.round(current.pm2_5)}</span>
            <span className="metric-unit">µg/m³</span>
          </div>
          <div className="dos-ascii-bar">
            [{renderDosBar(current.pm2_5, 80)}]
          </div>
        </div>
      </div>
    </article>
  )
}
