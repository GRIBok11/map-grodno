import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Создаем кастомные иконки для стрелочек
const createArrowIcon = (color, direction) => {
  const angle = direction || 0;
  
  return L.divIcon({
    html: `
      <div style="
        width: 0; 
        height: 0; 
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 12px solid ${color};
        transform: rotate(${angle}deg);
        transform-origin: center;
      "></div>
    `,
    className: 'route-arrow',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Компонент стрелочки на маршруте
const RouteArrow = ({ position, color, direction }) => {
  return (
    <Marker
      position={position}
      icon={createArrowIcon(color, direction)}
      interactive={false}
    />
  );
};

// Основной компонент для отображения стрелочек на маршруте
const RouteArrows = ({ coordinates, color, arrowCount = 3 }) => {
  if (!coordinates || coordinates.length < 2) return null;

  // Функция для вычисления направления между двумя точками
  const calculateDirection = (point1, point2) => {
    const dx = point2[1] - point1[1];
    const dy = point2[0] - point1[0];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle;
  };

  // Функция для получения случайных позиций вдоль маршрута
  const getArrowPositions = () => {
    const positions = [];
    
    // Если маршрут очень короткий, используем меньше стрелочек
    const actualArrowCount = Math.min(arrowCount, Math.max(1, Math.floor(coordinates.length / 3)));
    
    for (let i = 0; i < actualArrowCount; i++) {
      // Выбираем случайный сегмент маршрута
      const segmentIndex = Math.floor(Math.random() * (coordinates.length - 1));
      const startPoint = coordinates[segmentIndex];
      const endPoint = coordinates[segmentIndex + 1];
      
      // Случайная позиция вдоль сегмента (от 30% до 70% длины сегмента)
      const t = 0.3 + Math.random() * 0.4;
      const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * t;
      const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * t;
      
      const direction = calculateDirection(startPoint, endPoint);
      
      positions.push({
        position: [lat, lng],
        direction: direction
      });
    }
    
    return positions;
  };

  const arrowPositions = getArrowPositions();

  return (
    <>
      {arrowPositions.map((arrow, index) => (
        <RouteArrow
          key={index}
          position={arrow.position}
          color={color}
          direction={arrow.direction}
        />
      ))}
    </>
  );
};

export default RouteArrows;