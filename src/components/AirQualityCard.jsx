import { getAirQualityStatus } from '../api/weather';

/**
 * 대기질 및 미세먼지 카드 컴포넌트
 */
export default function AirQualityCard({ airData }) {
  const currentAir = airData?.current;
  const pm10 = currentAir?.pm10 ?? null;
  const pm25 = currentAir?.pm2_5 ?? null;
  const aqi = currentAir?.european_aqi ?? null;

  const airStatus = (pm10 !== null && pm25 !== null)
    ? getAirQualityStatus(pm10, pm25)
    : { status: '측정 중', badgeColor: '#64748b' };

  return (
    <section className="card air-quality-card">
      <div className="card-header">
        <span className="card-badge">대기질 지표</span>
        <h2 className="city-title">미세먼지 현황</h2>
      </div>

      <div className="air-primary">
        <div
          className="air-badge"
          style={{
            backgroundColor: `${airStatus.badgeColor}18`,
            color: airStatus.badgeColor,
            borderColor: airStatus.badgeColor,
          }}
        >
          <span className="air-status-text">{airStatus.status}</span>
          <span className="air-guide-label">
            한국 환경부 기준 {aqi !== null ? `(EU AQI: ${aqi})` : ''}
          </span>
        </div>
      </div>

      <div className="air-sub-metrics">
        <div className="metric-box">
          <div className="metric-info">
            <div className="metric-label-row">
              <span className="metric-label">미세먼지 (PM10)</span>
              <span className="metric-grade">
                {pm10 !== null
                  ? pm10 <= 30 ? '좋음' : pm10 <= 80 ? '보통' : pm10 <= 150 ? '나쁨' : '매우 나쁨'
                  : '-'}
              </span>
            </div>
            <div className="metric-num-row">
              <span className="air-val">{pm10 !== null ? Math.round(pm10) : '-'}</span>
              <span className="air-unit">㎍/㎥</span>
            </div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-info">
            <div className="metric-label-row">
              <span className="metric-label">초미세먼지 (PM2.5)</span>
              <span className="metric-grade">
                {pm25 !== null
                  ? pm25 <= 15 ? '좋음' : pm25 <= 35 ? '보통' : pm25 <= 75 ? '나쁨' : '매우 나쁨'
                  : '-'}
              </span>
            </div>
            <div className="metric-num-row">
              <span className="air-val">{pm25 !== null ? Math.round(pm25) : '-'}</span>
              <span className="air-unit">㎍/㎥</span>
            </div>
          </div>
        </div>
      </div>

      {/* 환경부 등급 기준 가이드 */}
      <div className="air-standards">
        <div className="standard-item"><span className="dot good"></span>좋음 (0~30)</div>
        <div className="standard-item"><span className="dot moderate"></span>보통 (31~80)</div>
        <div className="standard-item"><span className="dot unhealthy"></span>나쁨 (81~150)</div>
        <div className="standard-item"><span className="dot very-unhealthy"></span>매우나쁨 (151~)</div>
      </div>
    </section>
  );
}

