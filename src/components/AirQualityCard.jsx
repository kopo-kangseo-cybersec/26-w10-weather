import { Activity } from 'lucide-react';
import { getAirQualityStatus } from '../api/weather';

export default function AirQualityCard({ currentAir }) {
  if (!currentAir) return null;

  const { status, badgeColor } = getAirQualityStatus(
    currentAir.pm10,
    currentAir.pm2_5
  );

  return (
    <section className="card air-card">
      <div className="card-header">
        <div>
          <span className="card-badge">대기질 지수</span>
          <h2 className="city-title">미세먼지 정보</h2>
        </div>
        <div
          className="air-status-badge"
          style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor,
            borderColor: `${badgeColor}60`,
          }}
        >
          <Activity size={18} />
          <span>{status}</span>
        </div>
      </div>

      <div className="air-summary-banner" style={{ borderColor: badgeColor }}>
        <div className="air-summary-text">
          <span className="summary-title">환경부 기준 대기질 등급</span>
          <p className="summary-desc">
            {status === '좋음' &&
              '야외 활동을 하기에 아주 좋은 청정한 공기 상태입니다.'}
            {status === '보통' &&
              '무난한 공기질입니다. 실외 활동에 무리가 없습니다.'}
            {status === '나쁨' &&
              '공기가 탁합니다. 호흡기 질환자는 장시간 실외 활동을 자제하세요.'}
            {status === '매우 나쁨' &&
              '대기질이 매우 나쁩니다. 외출 시 보건용 마스크를 반드시 착용하세요.'}
          </p>
        </div>
        <div
          className="air-circle-badge"
          style={{
            backgroundColor: badgeColor,
          }}
        >
          {status}
        </div>
      </div>

      <div className="air-details-grid">
        <div className="air-item">
          <div className="air-item-head">
            <span className="air-metric-name">미세먼지 (PM10)</span>
            <span
              className="metric-tag"
              style={{
                color:
                  currentAir.pm10 <= 30
                    ? '#10b981'
                    : currentAir.pm10 <= 80
                    ? '#3b82f6'
                    : currentAir.pm10 <= 150
                    ? '#f97316'
                    : '#ef4444',
              }}
            >
              {currentAir.pm10 <= 30
                ? '좋음'
                : currentAir.pm10 <= 80
                ? '보통'
                : currentAir.pm10 <= 150
                ? '나쁨'
                : '매우 나쁨'}
            </span>
          </div>
          <div className="air-metric-value">
            <span className="metric-number">
              {Math.round(currentAir.pm10)}
            </span>
            <span className="metric-unit">μg/m³</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min((currentAir.pm10 / 200) * 100, 100)}%`,
                backgroundColor:
                  currentAir.pm10 <= 30
                    ? '#10b981'
                    : currentAir.pm10 <= 80
                    ? '#3b82f6'
                    : currentAir.pm10 <= 150
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
          </div>
        </div>

        <div className="air-item">
          <div className="air-item-head">
            <span className="air-metric-name">초미세먼지 (PM2.5)</span>
            <span
              className="metric-tag"
              style={{
                color:
                  currentAir.pm2_5 <= 15
                    ? '#10b981'
                    : currentAir.pm2_5 <= 35
                    ? '#3b82f6'
                    : currentAir.pm2_5 <= 75
                    ? '#f97316'
                    : '#ef4444',
              }}
            >
              {currentAir.pm2_5 <= 15
                ? '좋음'
                : currentAir.pm2_5 <= 35
                ? '보통'
                : currentAir.pm2_5 <= 75
                ? '나쁨'
                : '매우 나쁨'}
            </span>
          </div>
          <div className="air-metric-value">
            <span className="metric-number">
              {Math.round(currentAir.pm2_5)}
            </span>
            <span className="metric-unit">μg/m³</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min((currentAir.pm2_5 / 100) * 100, 100)}%`,
                backgroundColor:
                  currentAir.pm2_5 <= 15
                    ? '#10b981'
                    : currentAir.pm2_5 <= 35
                    ? '#3b82f6'
                    : currentAir.pm2_5 <= 75
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

