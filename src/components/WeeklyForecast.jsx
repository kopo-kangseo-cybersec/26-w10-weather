import { useMemo } from 'react';
import { CalendarDays, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function WeeklyForecast({ dailyData }) {
  const forecastDays = useMemo(() => {
    if (!dailyData?.time) return [];

    return dailyData.time.map((dateStr, idx) => {
      const date = new Date(dateStr);
      const dayOfWeek = DAY_NAMES[date.getDay()];
      const month = date.getMonth() + 1;
      const day = date.getDate();

      let dayLabel = `${dayOfWeek}요일`;
      if (idx === 0) dayLabel = '오늘';
      else if (idx === 1) dayLabel = '내일';

      const weather = getWeatherInfo(dailyData.weather_code[idx]);
      const maxTemp = Math.round(dailyData.temperature_2m_max[idx]);
      const minTemp = Math.round(dailyData.temperature_2m_min[idx]);
      const rainProb = dailyData.precipitation_probability_max
        ? dailyData.precipitation_probability_max[idx]
        : null;

      return {
        dateStr,
        formattedDate: `${month}.${day}`,
        dayLabel,
        weather,
        maxTemp,
        minTemp,
        rainProb,
      };
    });
  }, [dailyData]);

  if (forecastDays.length === 0) return null;

  // 전체 기간의 최저/최고 기온 (기온 막대 비율 계산용)
  const allMins = forecastDays.map((d) => d.minTemp);
  const allMaxs = forecastDays.map((d) => d.maxTemp);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const globalRange = Math.max(globalMax - globalMin, 1);

  return (
    <section className="card weekly-card">
      <div className="card-header">
        <div>
          <span className="card-badge">중기 기상 전망</span>
          <h2 className="city-title">7일간 주간 예보</h2>
        </div>
        <div className="weekly-summary-badge">
          <CalendarDays size={16} />
          <span>7일간 일별 전망</span>
        </div>
      </div>

      <div className="weekly-list">
        {forecastDays.map((item, index) => {
          // 기온 바의 시작 위치(left%)와 너비(width%) 계산
          const leftPercent =
            ((item.minTemp - globalMin) / globalRange) * 100;
          const widthPercent = Math.max(
            ((item.maxTemp - item.minTemp) / globalRange) * 100,
            6
          );

          return (
            <div
              key={item.dateStr}
              className={`weekly-row ${index === 0 ? 'today-row' : ''}`}
            >
              {/* 날짜 및 요일 */}
              <div className="weekly-day-col">
                <span className="weekly-day-name">{item.dayLabel}</span>
                <span className="weekly-date-sub">{item.formattedDate}</span>
              </div>

              {/* 날씨 상태 및 아이콘 */}
              <div className="weekly-weather-col">
                <WeatherIcon
                  name={item.weather.icon}
                  size={22}
                  color={item.weather.color}
                />
                <span className="weekly-weather-label">
                  {item.weather.label}
                </span>
              </div>

              {/* 강수 확률 */}
              <div className="weekly-rain-col">
                {item.rainProb !== null && item.rainProb > 0 ? (
                  <span className="rain-prob-tag">
                    <Droplets size={13} />
                    {item.rainProb}%
                  </span>
                ) : (
                  <span className="rain-prob-tag zero">-</span>
                )}
              </div>

              {/* 기온 표시 및 범위 게이지 바 */}
              <div className="weekly-temp-col">
                <span className="temp-min">{item.minTemp}°</span>

                <div className="temp-bar-track">
                  <div
                    className="temp-bar-segment"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="temp-max">{item.maxTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

