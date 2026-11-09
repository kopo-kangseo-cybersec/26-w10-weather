import { Clock, X, Trash2 } from 'lucide-react'

export default function RecentCities({ cities, onSelectCity, onRemoveCity, onClearAll }) {
  if (!cities || cities.length === 0) return null

  return (
    <div className="recent-cities-bar" aria-label="최근 조회한 도시 목록">
      <div className="recent-header">
        <div className="recent-title">
          <Clock size={14} />
          <span>최근 본 도시</span>
        </div>
        {cities.length > 1 && (
          <button
            type="button"
            className="clear-all-btn"
            onClick={onClearAll}
            title="최근 기록 모두 지우기"
          >
            <Trash2 size={12} />
            <span>비우기</span>
          </button>
        )}
      </div>

      <div className="recent-chips">
        {cities.map((city) => (
          <div key={`${city.name}-${city.lat}-${city.lon}`} className="recent-chip">
            <button
              type="button"
              className="chip-btn"
              onClick={() => onSelectCity(city)}
            >
              {city.name}
            </button>
            <button
              type="button"
              className="chip-remove"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveCity(city)
              }}
              title="삭제"
              aria-label={`${city.name} 기록 삭제`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
