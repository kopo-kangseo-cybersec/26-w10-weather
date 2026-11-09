import { Clock } from 'lucide-react';
import { getWeatherInfo } from '../api/weather';
import WeatherIcon from './WeatherIcon';

export default function HourlyChart({ hourly, currentTime }) {
  if (!hourly || !hourly.time || !hourly.temperature_2m) return null;

  // 현재 시각 이후 24시간 데이터 추출 (찾지 못하면 첫 24시간)
  let startIndex = 0;
  if (currentTime) {
    const currentHourPrefix = currentTime.slice(0, 13);
    const foundIdx = hourly.time.findIndex((t) =>
      t.startsWith(currentHourPrefix)
    );
    if (foundIdx !== -1) startIndex = foundIdx;
  }

  // 24시간 중 가독성을 위해 2시간 간격 12개 포인트 또는 24개 포인트 추출 (여기서는 24시간 전체를 스크롤/반응형으로 표시하되 2시간 간격 12포인트로 한눈에 깔끔하게 시각화)
  const slice24 = hourly.time
    .slice(startIndex, startIndex + 24)
    .map((timeStr, idx) => {
      const actualIdx = startIndex + idx;
      return {
        time: timeStr,
        hourLabel:
          idx === 0 ? '지금' : `${new Date(timeStr).getHours()}시`,
        temp: Math.round(hourly.temperature_2m[actualIdx]),
        rawTemp: hourly.temperature_2m[actualIdx],
        code: hourly.weather_code?.[actualIdx] ?? 0,
      };
    })
    .filter((_, idx) => idx % 2 === 0); // 2시간 간격 12개 포인트로 24시간 추이 표현

  if (slice24.length === 0) return null;

  const temps = slice24.map((d) => d.rawTemp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(maxTemp - minTemp, 4);

  const svgWidth = 760;
  const svgHeight = 140;
  const padX = 36;
  const padTop = 34;
  const padBottom = 24;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padTop - padBottom;

  const points = slice24.map((d, i) => {
    const x =
      slice24.length === 1
        ? svgWidth / 2
        : padX + (i / (slice24.length - 1)) * chartW;
    const y =
      padTop + chartH - ((d.rawTemp - minTemp) / tempRange) * chartH;
    return { ...d, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0].x},${svgHeight - padBottom} ${polylinePoints} ${
    points[points.length - 1].x
  },${svgHeight - padBottom}`;

  return (
    <section className="info-card full-width-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-label">24-Hour Forecast</span>
          <h2 className="card-city-name">
            <Clock size={20} color="#2563eb" />
            24시간 기온 변화 추이
          </h2>
        </div>
        <span className="chart-range-summary">
          최저 {Math.round(minTemp)}°C · 최고 {Math.round(maxTemp)}°C
        </span>
      </div>

      <div className="hourly-chart-scroll">
        <div className="hourly-chart-inner">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="hourly-svg"
            role="img"
            aria-label="24시간 기온 변화 꺾은선 차트"
          >
            <defs>
              <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 배경 가이드라인 */}
            <line
              x1={padX}
              y1={padTop}
              x2={svgWidth - padX}
              y2={padTop}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <line
              x1={padX}
              y1={padTop + chartH / 2}
              x2={svgWidth - padX}
              y2={padTop + chartH / 2}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <line
              x1={padX}
              y1={svgHeight - padBottom}
              x2={svgWidth - padX}
              y2={svgHeight - padBottom}
              stroke="#e2e8f0"
            />

            {/* 그라데이션 영역 */}
            <polygon points={areaPoints} fill="url(#tempAreaGrad)" />

            {/* 기온 꺾은선 */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />

            {/* 각 시간대 포인트 및 기온 텍스트 */}
            {points.map((p) => (
              <g key={p.time}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y={p.y - 11}
                  textAnchor="middle"
                  className="svg-temp-label"
                >
                  {p.temp}°
                </text>
              </g>
            ))}
          </svg>

          <div className="hourly-items-row">
            {points.map((p) => {
              const info = getWeatherInfo(p.code);
              return (
                <div key={p.time} className="hourly-item">
                  <WeatherIcon name={info.icon} size={20} color={info.color} />
                  <span className="hourly-time">{p.hourLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
