import { DEFAULT_CITIES } from '../api/weather';

export default function CityPresetButtons({ selectedCity, onSelectCity }) {
  return (
    <div className="city-preset-container">
      <div className="preset-scroll">
        {DEFAULT_CITIES.map((city) => {
          const isSelected = selectedCity.name === city.name;
          return (
            <button
              key={city.name}
              type="button"
              className={`preset-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCity(city)}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
