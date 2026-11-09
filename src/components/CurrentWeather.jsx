import { MapPin, Thermometer, Droplets, Wind, Sun, Moon } from 'lucide-react';
import { getWeatherInfo } from '../api/weather';
import WeatherIcon from './WeatherIcon';

export default function CurrentWeather({ cityName, current }) {
  if (!current) return null;

  const weatherInfo = getWeatherInfo(current.weather_code);
  const isDay = current.is_day === 1;

  return (
    <article className="info-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-label">Current Weather</span>
          <h2 className="card-city-name">
            <MapPin size={20} color="#2563eb" />
            {cityName}
          </h2>
        </div>
        <span className={`day-night-badge ${isDay ? 'day' : 'night'}`}>
          {isDay ? <Sun size={14} /> : <Moon size={14} />}
          {isDay ? '낮' : '밤'}
        </span>
      </div>

      <div className="weather-main">
        <div className="temperature-display">
          <span className="temp-value">
            {Math.round(current.temperature_2m)}°C
          </span>
          <span
            className="weather-status-label"
            style={{ color: weatherInfo.color }}
          >
            {weatherInfo.label}
          </span>
        </div>
        <div className="weather-icon-wrapper">
          <WeatherIcon
            name={weatherInfo.icon}
            size={54}
            color={weatherInfo.color}
          />
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">
            <Thermometer size={14} /> 체감온도
          </span>
          <span className="metric-value">
            {Math.round(current.apparent_temperature)}°C
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">
            <Droplets size={14} /> 습도
          </span>
          <span className="metric-value">{current.relative_humidity_2m}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">
            <Wind size={14} /> 풍속
          </span>
          <span className="metric-value">{current.wind_speed_10m} km/h</span>
        </div>
      </div>
    </article>
  );
}
