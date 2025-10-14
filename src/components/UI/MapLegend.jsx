import React from 'react';

const MapLegend = () => {
  return (
    <div className="map-legend">
      <div className="legend-title">Легенда карты</div>
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: 'blue'}}></div>
        <div className="legend-label">Границы районов</div>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#3cb44b'}}></div>
        <div className="legend-label">Маршруты понедельник</div>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#e6194b'}}></div>
        <div className="legend-label">Маршруты понедельник2</div>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{backgroundColor: '#4363d8'}}></div>
        <div className="legend-label">Построенные маршруты</div>
      </div>
    </div>
  );
};

export default MapLegend;