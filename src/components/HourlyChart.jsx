import { Clock } from 'lucide-react';

export default function HourlyChart({ hourly, tempUnit = 'C' }) {
  if (!hourly || !hourly.time || hourly.time.length === 0) return null;

  // 현재 시간 이후 향후 24시간 데이터 추출
  const now = new Date();
  const currentHourStr = now.toISOString().slice(0, 13); // "2026-11-23T12"

  let startIndex = hourly.time.findIndex((t) => t.startsWith(currentHourStr));
  if (startIndex === -1) startIndex = 0;

  const next24Times = hourly.time.slice(startIndex, startIndex + 24);
  const next24Temps = hourly.temperature_2m.slice(startIndex, startIndex + 24);

  if (next24Times.length === 0) return null;

  // 온도 변환 함수
  const formatTemp = (celsius) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  // SVG 차트 좌표 계산
  const width = 850;
  const height = 150;
  const paddingX = 40;
  const paddingTop = 35;
  const paddingBottom = 40;

  const minTemp = Math.min(...next24Temps);
  const maxTemp = Math.max(...next24Temps);
  const tempRange = maxTemp - minTemp === 0 ? 1 : maxTemp - minTemp;

  const getX = (index) => paddingX + (index / (next24Times.length - 1)) * (width - paddingX * 2);
  const getY = (temp) =>
    height - paddingBottom - ((temp - minTemp) / tempRange) * (height - paddingTop - paddingBottom);

  // SVG Path 생성
  const points = next24Temps.map((temp, i) => `${getX(i)},${getY(temp)}`);
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${getX(next24Times.length - 1)},${height - paddingBottom} L ${getX(0)},${height - paddingBottom} Z`;

  return (
    <div className="card hourly-chart-card">
      <div className="card-header">
        <div className="card-title-group">
          <Clock size={18} className="title-icon" />
          <h3>24시간 시간별 기온 예보</h3>
        </div>
      </div>

      <div className="chart-scroll-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="hourly-svg-chart">
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 그라데이션 채우기 */}
          <path d={areaD} fill="url(#tempGradient)" />

          {/* 꺾은선 패스 */}
          <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />

          {/* 데이터 포인트, 온도 레이블, 시간 */}
          {next24Temps.map((temp, i) => {
            const x = getX(i);
            const y = getY(temp);
            const timeObj = new Date(next24Times[i]);
            const hourLabel = `${timeObj.getHours()}시`;

            return (
              <g key={next24Times[i]} className="chart-point-group">
                {/* 점 포인트 */}
                <circle cx={x} cy={y} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />

                {/* 온도 수치 */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="chart-temp-text"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--text-h)"
                >
                  {formatTemp(temp)}
                </text>

                {/* 시간 레이블 */}
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className="chart-time-text"
                  fontSize="11"
                  fill="var(--text)"
                >
                  {hourLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
