import {
  Thermometer,
  Droplets,
  Wind,
  CloudRainWind,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function CurrentWeather({ city, currentWeather }) {
  if (!currentWeather) return null;

  const weatherInfo = getWeatherInfo(currentWeather.weather_code);

  return (
    <section className="card weather-card">
      <div className="card-header">
        <div>
          <span className="card-badge">현재 날씨</span>
          <h2 className="city-title">{city.name}</h2>
        </div>
        <div
          className="weather-badge"
          style={{
            backgroundColor: `${weatherInfo.color}20`,
            color: weatherInfo.color,
            borderColor: `${weatherInfo.color}60`,
          }}
        >
          <WeatherIcon
            name={weatherInfo.icon}
            size={22}
            color={weatherInfo.color}
          />
          <span>{weatherInfo.label}</span>
        </div>
      </div>

      <div className="current-temp-block">
        <div className="temp-display">
          <span className="temp-number">
            {Math.round(currentWeather.temperature_2m)}
          </span>
          <span className="temp-unit">°C</span>
        </div>
        <div className="weather-icon-large">
          <WeatherIcon
            name={weatherInfo.icon}
            size={72}
            color={weatherInfo.color}
          />
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <div className="detail-icon-wrap temp-feel">
            <Thermometer size={18} />
          </div>
          <div>
            <span className="detail-label">체감 온도</span>
            <strong className="detail-value">
              {Math.round(currentWeather.apparent_temperature)}°C
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon-wrap humidity">
            <Droplets size={18} />
          </div>
          <div>
            <span className="detail-label">상대 습도</span>
            <strong className="detail-value">
              {currentWeather.relative_humidity_2m}%
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon-wrap wind">
            <Wind size={18} />
          </div>
          <div>
            <span className="detail-label">풍속</span>
            <strong className="detail-value">
              {currentWeather.wind_speed_10m} km/h
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon-wrap rain">
            <CloudRainWind size={18} />
          </div>
          <div>
            <span className="detail-label">강수량</span>
            <strong className="detail-value">
              {currentWeather.precipitation} mm
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

