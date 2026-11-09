import { MapPin } from 'lucide-react'

export default function CitySelector({ cities, selectedCity, onSelectCity, disabled }) {
  return (
    <section className="city-selector-section retro-window" aria-label="주요 도시 선택">
      <div className="retro-titlebar">
        <span className="title-text">SELECT_CITY.BAT</span>
        <div className="titlebar-controls">
          <span className="win-btn">_</span>
          <span className="win-btn">■</span>
        </div>
      </div>
      <div className="city-button-list retro-content">
        {cities.map((city) => {
          const isSelected = selectedCity.name === city.name
          return (
            <button
              key={city.name}
              type="button"
              className={`retro-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCity(city)}
              disabled={disabled && isSelected}
            >
              <MapPin size={16} />
              <span>{city.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
