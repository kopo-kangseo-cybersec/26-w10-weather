import { History, X, Trash2 } from 'lucide-react';

export default function RecentCities({
  recentCities,
  currentCity,
  onSelectCity,
  onRemoveCity,
  onClearAll,
}) {
  if (!recentCities || recentCities.length === 0) return null;

  return (
    <div className="recent-cities-section">
      <div className="recent-cities-header">
        <div className="recent-title">
          <History size={14} />
          <span>최근 확인한 도시</span>
        </div>
        {recentCities.length > 1 && (
          <button
            type="button"
            className="recent-clear-all-btn"
            onClick={onClearAll}
            title="최근 기록 모두 지우기"
          >
            <Trash2 size={12} />
            <span>기록 삭제</span>
          </button>
        )}
      </div>

      <div className="recent-chips-list">
        {recentCities.map((city) => {
          const isSelected =
            city.lat === currentCity.lat && city.lon === currentCity.lon;

          return (
            <div
              key={city.name}
              className={`recent-chip ${isSelected ? 'active' : ''}`}
            >
              <button
                type="button"
                className="recent-chip-label"
                onClick={() => onSelectCity(city)}
              >
                {city.name}
              </button>
              <button
                type="button"
                className="recent-chip-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCity(city.name);
                }}
                aria-label={`${city.name} 삭제`}
                title="삭제"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

