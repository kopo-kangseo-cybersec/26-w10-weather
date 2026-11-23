import { Calendar, Droplets } from 'lucide-react';
import { getWeatherInfo } from '../api/weather';
import WeatherIcon from './WeatherIcon';

export default function WeeklyForecast({ daily, tempUnit = 'C' }) {
  if (!daily || !daily.time || daily.time.length === 0) return null;

  // 온도 변환 함수
  const formatTemp = (celsius) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  // 요일 및 날짜 표시 유틸
  const getDayLabel = (dateStr, index) => {
    if (index === 0) return '오늘';
    if (index === 1) return '내일';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { weekday: 'short' });
  };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="card weekly-forecast-card">
      <div className="card-header">
        <div className="card-title-group">
          <Calendar size={18} className="title-icon" />
          <h3>향후 7일간 주간 예보</h3>
        </div>
      </div>

      <div className="weekly-list">
        {daily.time.slice(0, 7).map((time, i) => {
          const code = daily.weather_code[i];
          const info = getWeatherInfo(code);
          const maxTemp = daily.temperature_2m_max[i];
          const minTemp = daily.temperature_2m_min[i];
          const precipProb = daily.precipitation_probability_max?.[i] ?? 0;

          return (
            <div key={time} className="weekly-item">
              <div className="day-col">
                <span className="day-name">{getDayLabel(time, i)}</span>
                <span className="date-sub">{getDateLabel(time)}</span>
              </div>

              <div className="weather-col" style={{ color: info.color }}>
                <WeatherIcon name={info.icon} size={24} />
                <span className="weather-desc">{info.label}</span>
              </div>

              <div className="rain-col">
                {precipProb > 0 ? (
                  <span className="rain-prob">
                    <Droplets size={12} />
                    {precipProb}%
                  </span>
                ) : (
                  <span className="rain-none">-</span>
                )}
              </div>

              <div className="temp-range-col">
                <span className="min-temp">{formatTemp(minTemp)}</span>
                <div className="temp-bar-bg">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: '20%',
                      width: '60%',
                    }}
                  />
                </div>
                <span className="max-temp">{formatTemp(maxTemp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
