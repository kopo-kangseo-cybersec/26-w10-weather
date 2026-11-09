import { Calendar, Droplets } from 'lucide-react';
import { getWeatherInfo } from '../api/weather';
import WeatherIcon from './WeatherIcon';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatDayLabel(dateStr, index) {
  const date = new Date(`${dateStr}T00:00:00`);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAY_NAMES[date.getDay()];
  if (index === 0) return { title: '오늘', dateText: `${month}.${day} (${dayOfWeek})` };
  if (index === 1) return { title: '내일', dateText: `${month}.${day} (${dayOfWeek})` };
  return { title: `${dayOfWeek}요일`, dateText: `${month}.${day}` };
}

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time) return null;

  const days = daily.time.slice(0, 7).map((dateStr, idx) => ({
    dateStr,
    ...formatDayLabel(dateStr, idx),
    code: daily.weather_code?.[idx] ?? 0,
    maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 0),
    minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 0),
    precipProb: daily.precipitation_probability_max?.[idx] ?? 0,
  }));

  const weekMin = Math.min(...days.map((d) => d.minTemp));
  const weekMax = Math.max(...days.map((d) => d.maxTemp));
  const weekRange = Math.max(weekMax - weekMin, 1);

  return (
    <section className="info-card full-width-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-label">7-Day Forecast</span>
          <h2 className="card-city-name">
            <Calendar size={20} color="#2563eb" />
            7일간 주간 예보
          </h2>
        </div>
      </div>

      <div className="weekly-list">
        {days.map((day) => {
          const info = getWeatherInfo(day.code);
          const leftPercent = ((day.minTemp - weekMin) / weekRange) * 100;
          const widthPercent = Math.max(
            ((day.maxTemp - day.minTemp) / weekRange) * 100,
            8
          );

          return (
            <div key={day.dateStr} className="weekly-row">
              <div className="weekly-day-col">
                <span className="weekly-day-title">{day.title}</span>
                <span className="weekly-day-date">{day.dateText}</span>
              </div>

              <div className="weekly-status-col">
                <WeatherIcon name={info.icon} size={24} color={info.color} />
                <span className="weekly-status-label">{info.label}</span>
              </div>

              <div className="weekly-precip-col">
                <Droplets size={14} color="#38bdf8" />
                <span>{day.precipProb}%</span>
              </div>

              <div className="weekly-temp-col">
                <span className="weekly-min">{day.minTemp}°</span>
                <div className="weekly-bar-track">
                  <div
                    className="weekly-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
                <span className="weekly-max">{day.maxTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
