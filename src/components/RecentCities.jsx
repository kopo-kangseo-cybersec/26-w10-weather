import { Clock, X, MapPin } from 'lucide-react';

export default function RecentCities({ recentCities, onSelectCity, onRemoveCity }) {
  if (!recentCities || recentCities.length === 0) return null;

  return (
    <div className="recent-cities-wrapper">
      <div className="recent-label">
        <Clock size={14} />
        <span>최근 본 도시</span>
      </div>
      <div className="recent-list">
        {recentCities.map((city) => (
          <span key={city.name} className="recent-pill">
            <button
              type="button"
              className="recent-name-btn"
              onClick={() => onSelectCity(city)}
            >
              <MapPin size={12} />
              {city.name}
            </button>
            <button
              type="button"
              className="recent-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCity(city.name);
              }}
              title="삭제"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
