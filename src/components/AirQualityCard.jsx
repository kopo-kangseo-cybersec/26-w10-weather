import { ShieldAlert, Sparkles } from 'lucide-react';
import { getAirQualityStatus } from '../api/weather';

export default function AirQualityCard({ airQualityData }) {
  const pm10 = airQualityData?.current?.pm10 ?? 0;
  const pm25 = airQualityData?.current?.pm2_5 ?? 0;
  const aqStatus = getAirQualityStatus(pm10, pm25);

  const pm10Percent = Math.min(100, Math.round((pm10 / 150) * 100));
  const pm25Percent = Math.min(100, Math.round((pm25 / 75) * 100));

  return (
    <article className="info-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-label">Air Quality</span>
          <h2 className="card-city-name">대기질 · 미세먼지</h2>
        </div>
        <span
          className="aq-badge"
          style={{ backgroundColor: aqStatus.badgeColor }}
        >
          {aqStatus.status === '좋음' || aqStatus.status === '보통' ? (
            <Sparkles size={15} />
          ) : (
            <ShieldAlert size={15} />
          )}
          {aqStatus.status}
        </span>
      </div>

      <div className="aq-list">
        <div className="aq-box">
          <span className="aq-box-title">미세먼지 (PM10)</span>
          <div className="aq-box-value">
            {Math.round(pm10)}
            <span className="aq-unit">μg/m³</span>
          </div>
          <div className="aq-progress-track">
            <div
              className="aq-progress-fill"
              style={{
                width: `${pm10Percent}%`,
                backgroundColor: aqStatus.badgeColor,
              }}
            />
          </div>
        </div>
        <div className="aq-box">
          <span className="aq-box-title">초미세먼지 (PM2.5)</span>
          <div className="aq-box-value">
            {Math.round(pm25)}
            <span className="aq-unit">μg/m³</span>
          </div>
          <div className="aq-progress-track">
            <div
              className="aq-progress-fill"
              style={{
                width: `${pm25Percent}%`,
                backgroundColor: aqStatus.badgeColor,
              }}
            />
          </div>
        </div>
      </div>

      <p className="aq-guide">
        환경부 기준 등급 판정: 좋음(PM10 ≤ 30 / PM2.5 ≤ 15) · 보통(≤ 80 / ≤ 35) · 나쁨(≤ 150 / ≤ 75) · 매우 나쁨(151+ / 76+)
      </p>
    </article>
  );
}
