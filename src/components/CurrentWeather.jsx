import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

/**
 * 실시간 현재 날씨 카드 컴포넌트
 */
export default function CurrentWeather({ city, weatherData }) {
  const current = weatherData?.current;
  if (!current) return null;

  const weatherInfo = getWeatherInfo(current.weather_code);
  const temp = Math.round(current.temperature_2m);
  const apparentTemp = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = current.wind_speed_10m;
  const precipitation = current.precipitation ?? 0;

  return (
    <section className="card current-weather-card">
      <div className="card-header">
        <span className="card-badge">현재 날씨</span>
        <h2 className="city-title">{city.name}</h2>
      </div>

      <div className="weather-primary">
        <div
          className="weather-icon-wrapper"
          style={{ backgroundColor: `${weatherInfo.color}18` }}
        >
          <WeatherIcon iconName={weatherInfo.icon} size={64} color={weatherInfo.color} />
        </div>
        <div className="temp-block">
          <span className="temp-value">{temp}</span>
          <span className="temp-unit">°C</span>
        </div>
        <div
          className="condition-tag"
          style={{ borderColor: weatherInfo.color, color: weatherInfo.color }}
        >
          {weatherInfo.label}
        </div>
      </div>

      <div className="weather-sub-metrics">
        <div className="metric-box">
          <div className="metric-icon"><Thermometer size={18} /></div>
          <div className="metric-info">
            <span className="metric-label">체감 온도</span>
            <span className="metric-val">{apparentTemp}°C</span>
          </div>
        </div>
        <div className="metric-box">
          <div className="metric-icon"><Droplets size={18} /></div>
          <div className="metric-info">
            <span className="metric-label">상대 습도</span>
            <span className="metric-val">{humidity}%</span>
          </div>
        </div>
        <div className="metric-box">
          <div className="metric-icon"><Wind size={18} /></div>
          <div className="metric-info">
            <span className="metric-label">바람 세기</span>
            <span className="metric-val">{windSpeed} km/h</span>
          </div>
        </div>
        <div className="metric-box">
          <div className="metric-icon"><CloudRain size={18} /></div>
          <div className="metric-info">
            <span className="metric-label">시간당 강수량</span>
            <span className="metric-val">{precipitation} mm</span>
          </div>
        </div>
      </div>
    </section>
  );
}

