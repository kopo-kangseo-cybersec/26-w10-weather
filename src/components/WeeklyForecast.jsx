import { Calendar, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

/**
 * 7일간 주간 기상 예보 카드 컴포넌트
 */
export default function WeeklyForecast({ weatherData }) {
  const daily = weatherData?.daily;
  if (!daily || !daily.time || daily.time.length === 0) return null;

  // 전체 기간 중 최저/최고 기온 산출 (온도 바 비율 계산용)
  const allMins = daily.temperature_2m_min || [];
  const allMaxs = daily.temperature_2m_max || [];
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const tempSpan = globalMax === globalMin ? 1 : globalMax - globalMin;

  const days = daily.time.map((dateStr, idx) => {
    const date = new Date(dateStr);
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    const label = idx === 0 ? '오늘' : idx === 1 ? '내일' : `${dayOfWeek}요일`;
    const formattedDate = `${date.getMonth() + 1}.${date.getDate()}`;

    const code = daily.weather_code[idx];
    const weatherInfo = getWeatherInfo(code);
    const maxTemp = Math.round(daily.temperature_2m_max[idx]);
    const minTemp = Math.round(daily.temperature_2m_min[idx]);
    const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0;

    // 기온 바의 좌측 오프셋과 너비 백분율
    const leftPercent = Math.max(0, ((minTemp - globalMin) / tempSpan) * 100);
    const widthPercent = Math.max(12, ((maxTemp - minTemp) / tempSpan) * 100);

    return {
      dateStr,
      label,
      formattedDate,
      weatherInfo,
      maxTemp,
      minTemp,
      precipProb,
      leftPercent,
      widthPercent,
    };
  });

  return (
    <section className="card weekly-forecast-card">
      <div className="card-header-row">
        <div className="card-header">
          <span className="card-badge">중기 기상 전망</span>
          <h2 className="city-title">향후 7일간 예보</h2>
        </div>
        <div className="weekly-summary-tag">
          <Calendar size={16} /> 일별 상세 기온 & 강수 확률
        </div>
      </div>

      <div className="weekly-list">
        {days.map((day, idx) => (
          <div key={day.dateStr} className={`weekly-row ${idx === 0 ? 'is-today' : ''}`}>
            {/* 1. 날짜 및 요일 */}
            <div className="day-col">
              <span className="day-name">{day.label}</span>
              <span className="day-date">{day.formattedDate}</span>
            </div>

            {/* 2. 날씨 상태 & 강수 확률 */}
            <div className="weather-col">
              <WeatherIcon
                iconName={day.weatherInfo.icon}
                size={24}
                color={day.weatherInfo.color}
              />
              <span className="weather-desc">{day.weatherInfo.label}</span>
              {day.precipProb > 0 ? (
                <span className="precip-prob" title="최대 강수 확률">
                  <Droplets size={12} /> {day.precipProb}%
                </span>
              ) : (
                <span className="precip-prob empty">-</span>
              )}
            </div>

            {/* 3. 기온 범위 바 및 수치 */}
            <div className="temp-range-col">
              <span className="temp-min">{day.minTemp}°</span>
              <div className="range-bar-track">
                <div
                  className="range-bar-fill"
                  style={{
                    left: `${day.leftPercent}%`,
                    width: `${day.widthPercent}%`,
                  }}
                />
              </div>
              <span className="temp-max">{day.maxTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

