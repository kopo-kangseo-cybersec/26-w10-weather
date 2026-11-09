import { MapPin } from 'lucide-react'

export default function CitySelector({ cities, selectedCity, onSelectCity, disabled }) {
  return (
    <section className="city-selector-section" aria-label="주요 도시 선택">
      <div className="city-button-list">
        {cities.map((city) => {
          const isSelected = selectedCity.name === city.name
          return (
            <button
              key={city.name}
              type="button"
              className={`city-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCity(city)}
              disabled={disabled && isSelected}
            >
              <MapPin size={15} />
              <span>{city.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

