import { useState, useId } from 'react';
import { Clock } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

/**
 * 24시간 시간별 기온 변화 SVG 꺾은선 차트 컴포넌트
 */
export default function HourlyChart({ weatherData }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const gradientId = useId();

  const hourly = weatherData?.hourly;
  if (!hourly || !hourly.time || hourly.time.length === 0) return null;

  // 현재 시간 기준 또는 시작 지점부터 24시간 데이터 추출
  const now = new Date();
  const currentIsoPrefix = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
  let startIndex = hourly.time.findIndex((t) => t.startsWith(currentIsoPrefix));
  if (startIndex === -1) startIndex = 0;

  // 24개 시간 데이터 슬라이스
  const sliceEnd = Math.min(startIndex + 24, hourly.time.length);
  const hours = hourly.time.slice(startIndex, sliceEnd).map((t, idx) => {
    const originalIdx = startIndex + idx;
    const timeObj = new Date(t);
    const hourNum = timeObj.getHours();
    const temp = Math.round(hourly.temperature_2m[originalIdx]);
    const weatherCode = hourly.weather_code ? hourly.weather_code[originalIdx] : 0;
    const weatherInfo = getWeatherInfo(weatherCode);

    return {
      timeLabel: idx === 0 ? '지금' : `${hourNum}시`,
      rawTime: t,
      temp,
      weatherCode,
      weatherInfo,
    };
  });

  if (hours.length === 0) return null;

  // 차트 크기 및 스케일 계산
  const width = 800;
  const height = 180;
  const paddingTop = 36;
  const paddingBottom = 48;
  const paddingHorizontal = 32;

  const temps = hours.map((h) => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp === minTemp ? 1 : maxTemp - minTemp;

  // 점들의 (x, y) 좌표 계산
  const usableWidth = width - paddingHorizontal * 2;
  const usableHeight = height - paddingTop - paddingBottom;

  const points = hours.map((h, i) => {
    const x = paddingHorizontal + (i / (hours.length - 1)) * usableWidth;
    const normalized = (h.temp - minTemp) / tempRange;
    const y = paddingTop + (1 - normalized) * usableHeight;
    return { ...h, x, y };
  });

  // SVG 패스 생성
  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPolygonPoints = `${points[0].x.toFixed(1)},${height - paddingBottom + 10} ${polylinePoints} ${points[points.length - 1].x.toFixed(1)},${height - paddingBottom + 10}`;

  return (
    <section className="card hourly-chart-card">
      <div className="card-header-row">
        <div className="card-header">
          <span className="card-badge">24시간 시간대별 예보</span>
          <h2 className="city-title">기온 변화 추이</h2>
        </div>
        <div className="hourly-summary-tag">
          <Clock size={16} /> 향후 24시간 ({minTemp}°C ~ {maxTemp}°C)
        </div>
      </div>

      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="hourly-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 배경 그라데이션 영역 */}
          <polygon points={areaPolygonPoints} fill={`url(#${gradientId})`} />

          {/* 꺾은선 라인 */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 및 라벨 */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const showDetail = idx % 2 === 0 || idx === 0 || idx === points.length - 1 || isHovered;

            return (
              <g
                key={p.rawTime}
                className="chart-point-group"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* 상단 기온 라벨 */}
                {showDetail && (
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className="chart-temp-label"
                    fontSize={isHovered ? '13' : '11'}
                    fontWeight="700"
                    fill="currentColor"
                  >
                    {p.temp}°
                  </text>
                )}

                {/* 데이터 점 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : (showDetail ? 4 : 2.5)}
                  fill={isHovered ? '#2563eb' : '#ffffff'}
                  stroke="#3b82f6"
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* 하단 시간 라벨 */}
                {showDetail && (
                  <text
                    x={p.x}
                    y={height - 18}
                    textAnchor="middle"
                    className="chart-time-label"
                    fontSize="11"
                    fill="currentColor"
                    opacity={idx === 0 ? 1 : 0.75}
                    fontWeight={idx === 0 ? '700' : '500'}
                  >
                    {p.timeLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 가로 스크롤 가능한 시간대별 날씨 아이콘 미니 바 */}
      <div className="hourly-items-scroll">
        {hours.map((h, i) => (
          <div
            key={h.rawTime}
            className={`hourly-mini-item ${hoveredIndex === i ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="mini-time">{h.timeLabel}</span>
            <WeatherIcon
              iconName={h.weatherInfo.icon}
              size={22}
              color={h.weatherInfo.color}
            />
            <span className="mini-temp">{h.temp}°C</span>
          </div>
        ))}
      </div>
    </section>
  );
}

