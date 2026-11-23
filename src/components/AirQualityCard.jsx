import { Activity, ShieldAlert } from 'lucide-react';
import { getAirQualityStatus } from '../api/weather';

export default function AirQualityCard({ airQuality }) {
  if (!airQuality || !airQuality.current) return null;

  const { pm10, pm2_5 } = airQuality.current;
  const pm10Val = Math.round(pm10 ?? 0);
  const pm25Val = Math.round(pm2_5 ?? 0);

  const { status, badgeColor } = getAirQualityStatus(pm10Val, pm25Val);

  // 진행 바 계산 (최대 기준치에 비례)
  const pm10Percent = Math.min(100, Math.round((pm10Val / 180) * 100));
  const pm25Percent = Math.min(100, Math.round((pm25Val / 90) * 100));

  return (
    <div className="card air-quality-card">
      <div className="card-header">
        <div className="card-title-group">
          <Activity size={20} className="title-icon" />
          <h3>미세먼지 대기질</h3>
        </div>
        <div className="overall-status-badge" style={{ backgroundColor: badgeColor }}>
          {status}
        </div>
      </div>

      <div className="air-metrics-container">
        {/* 미세먼지 PM10 */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-name">미세먼지 (PM10)</span>
            <span className="metric-num">
              <strong>{pm10Val}</strong> <small>μg/m³</small>
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${pm10Percent}%`,
                backgroundColor: badgeColor,
              }}
            />
          </div>
          <div className="metric-standard">
            <span>좋음 0~30</span>
            <span>보통 ~80</span>
            <span>나쁨 ~150</span>
          </div>
        </div>

        {/* 초미세먼지 PM2.5 */}
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-name">초미세먼지 (PM2.5)</span>
            <span className="metric-num">
              <strong>{pm25Val}</strong> <small>μg/m³</small>
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${pm25Percent}%`,
                backgroundColor: badgeColor,
              }}
            />
          </div>
          <div className="metric-standard">
            <span>좋음 0~15</span>
            <span>보통 ~35</span>
            <span>나쁨 ~75</span>
          </div>
        </div>
      </div>

      <div className="air-guide-footer">
        <ShieldAlert size={14} className="guide-icon" />
        <span>대한민국 환경부 4단계 기준 준수</span>
      </div>
    </div>
  );
}
