// src/components/PointList/PointList.jsx
import React from 'react';
import './PointList.css';

const PointList = ({ points, selectedPoints, onPointSelect, visible }) => {
  if (!visible) return null;

  return (
    <div className="panel-section">
      <div className="section-title">Точки</div>
      <div id="pointList">
        {points.length === 0 ? (
          <div className="placeholder-text">Точки появятся здесь после загрузки</div>
        ) : (
          points.map(point => (
            <div
              key={point.id}
              className={`point-entry ${selectedPoints.includes(point.id) ? 'selected' : ''}`}
              onClick={() => onPointSelect(point.id)}
            >
              <b>{point.name}</b>
              <div style={{fontSize: '0.8em', color: '#666', marginTop: '4px'}}>{point.address}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PointList;