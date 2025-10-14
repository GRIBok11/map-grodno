import React from 'react'

const PointList = ({ 
  points, 
  selectedPoints, 
  onPointSelect, 
  visible, 
  searchQuery, 
  setSearchQuery 
}) => {
  if (!visible) return null;
  
  return (
    <div className="panel-section">
      <div className="section-title">Точки</div>
      
      {/* Поле поиска в боковой панели */}
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Поиск по адресу или названию" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div id="pointList">
        {points.length === 0 ? (
          <div className="placeholder-text">Выберите группу точек для отображения</div>
        ) : (
          points.map(point => (
            <label 
              key={point.id}
              className={selectedPoints.includes(point.id) ? 'selected' : ''}
            >
              <input 
                type="checkbox" 
                checked={selectedPoints.includes(point.id)}
                onChange={() => onPointSelect(point.id)}
              />
              <b>{point.name}</b><br />
              <small>{point.address}</small>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

export default PointList;