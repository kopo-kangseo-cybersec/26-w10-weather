import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function HourlyChart({ hourlyData }) {
  // 시간별 기온 데이터 (첫 24시간 슬라이스)
  const chartData = useMemo(() => {
    if (!hourlyData?.time || !hourlyData?.temperature_2m) return [];

    // 24시간 데이터 추출
    const times = hourlyData.time.slice(0, 24);
    const temps = hourlyData.temperature_2m.slice(0, 24);
    const codes = hourlyData.weather_code.slice(0, 24);

    return times.map((t, idx) => {
      // "YYYY-MM-DDTHH:MM" 형식에서 시간 파싱 (순수 문자열 연산)
      const hourStr = t.slice(11, 13);
      const hour = parseInt(hourStr, 10);
      const label = `${hour}시`;

      return {
        time: t,
        label,
        hour,
        temp: Math.round(temps[idx]),
        code: codes[idx],
        weather: getWeatherInfo(codes[idx]),
      };
    });
  }, [hourlyData]);

  if (chartData.length === 0) return null;

  // SVG 좌표 계산
  const temps = chartData.map((d) => d.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = Math.max(maxTemp - minTemp, 1);

  // 차트 크기 (가로 24개 포인트에 맞춘 넓은 viewBox)
  const pointWidth = 52;
  const chartWidth = Math.max(chartData.length * pointWidth, 750);
  const chartHeight = 150;
  const paddingTop = 36;
  const paddingBottom = 40;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const points = chartData.map((d, i) => {
    const x = 26 + i * ((chartWidth - 52) / (chartData.length - 1));
    const y = paddingTop + ((maxTemp - d.temp) / tempRange) * usableHeight;
    return { ...d, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const polygonPoints = `26,${chartHeight - paddingBottom} ${polylinePoints} ${
    points[points.length - 1].x
  },${chartHeight - paddingBottom}`;

  return (
    <section className="card hourly-card">
      <div className="card-header">
        <div>
          <span className="card-badge">시간별 기상 추이</span>
          <h2 className="city-title">24시간 기온 예보</h2>
        </div>
        <div className="hourly-summary-badge">
          <Clock size={16} />
          <span>오늘 24시간</span>
        </div>
      </div>

      <div className="hourly-scroll-container">
        <div className="hourly-svg-wrapper" style={{ minWidth: `${chartWidth}px` }}>
          <svg
            className="hourly-svg"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height={chartHeight}
          >
            <defs>
              <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 영역 그라디언트 채우기 */}
            <polygon points={polygonPoints} fill="url(#hourlyTempGrad)" />

            {/* 꺾은선 라인 */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 각 데이터 포인트 점, 기온 및 라벨 */}
            {points.map((p, idx) => (
              <g key={p.time} className="hourly-point-group">
                {/* 기온 텍스트 */}
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="hourly-temp-text"
                  fill="var(--text-h)"
                  fontSize="13"
                  fontWeight="600"
                >
                  {p.temp}°
                </text>

                {/* 포인트 원 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={idx === 0 ? 5 : 3.5}
                  fill={idx === 0 ? 'var(--accent)' : 'var(--bg)'}
                  stroke="var(--accent)"
                  strokeWidth="2"
                />

                {/* 하단 시간 라벨 */}
                <text
                  x={p.x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="hourly-time-text"
                  fill={idx === 0 ? 'var(--accent)' : 'var(--text)'}
                  fontSize="12"
                  fontWeight={idx === 0 ? '700' : '500'}
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          {/* 시간대별 날씨 아이콘 행 */}
          <div className="hourly-icons-row" style={{ width: `${chartWidth}px` }}>
            {points.map((p) => (
              <div
                key={`icon-${p.time}`}
                className="hourly-icon-col"
                style={{ left: `${p.x}px` }}
                title={`${p.label}: ${p.weather.label} (${p.temp}°C)`}
              >
                <WeatherIcon
                  name={p.weather.icon}
                  size={18}
                  color={p.weather.color}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
