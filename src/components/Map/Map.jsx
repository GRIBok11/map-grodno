// src/components/Map/Map.jsx
import React, { useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Кастомная иконка для машинки
const createCarIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #e6194b;
        width: 24px;
        height: 24px;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">🚗</div>
    `,
    className: 'car-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// MapController должен быть отдельным компонентом
const MapController = ({ mapRef }) => {
  const map = useMap(); 
  
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
    window.leafletMap = map; // Сохраняем для глобального доступа
  }, [map, mapRef]);
  
  return null;
};

// Изменили название с Map на MapComponent
const MapComponent = ({
  center = [53.9, 27.56],
  zoom = 7,
  districts,
  districtStyle,
  points,
  showPoints,
  selectedPoints,
  onPointSelect,
  routes,
  showRoutes,
  showRoads,
  onRouteClick,
  cars = [] // Добавляем машинки
}) => {
  const mapRef = useRef();
  
  // Переменная должна быть внутри основного компонента
  const tileserverUrl = import.meta.env.VITE_TILESERVER_URL || 'http://localhost:8080';

  const handleMarkerClick = useCallback((pointId) => {
    onPointSelect && onPointSelect(pointId);
  }, [onPointSelect]);

  const handleRouteClick = useCallback((routeId) => {
    onRouteClick && onRouteClick(routeId);
  }, [onRouteClick]);

  console.log('Tileserver URL:', tileserverUrl); // Для отладки

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <MapController mapRef={mapRef} />
      
      {/* Исправлен URL - убраны кавычки и добавлен attribution */}
      <TileLayer
        url={`${tileserverUrl}/styles/basic-preview/{z}/{x}/{y}.png`}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Отображение границ районов */}
      {districts && (
        <GeoJSON
          data={districts}
          style={districtStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties && feature.properties.name) {
              layer.bindPopup(feature.properties.name);
            }
          }}
        />
      )}

      {/* Отображение точек */}
      {showPoints && points && points.map(point => (
        <Marker
          key={point.id}
          position={[point.lat, point.lon]}
          eventHandlers={{
            click: () => handleMarkerClick(point.id)
          }}
        >
          <Popup>
            <div>
              <b>{point.name}</b><br />
              {point.address}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Отображение машинок */}
      {cars && cars.map(car => (
        <Marker
          key={car.id}
          position={[car.lat, car.lng]}
          icon={createCarIcon()}
        >
          <Popup>
            <div>
              <b>{car.name}</b><br />
              Координаты: {car.lat?.toFixed(4)}, {car.lng?.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Отображение маршрутов и дорог */}
      {routes && routes.map(route => {
        // Показываем маршруты только если showRoutes включено и тип не geojson
        if (!showRoutes && route.type !== 'geojson') return null;
        // Показываем дороги только если showRoads включено и тип geojson
        if (!showRoads && route.type === 'geojson') return null;
        
        return (
          <React.Fragment key={route.id}>
            {/* Обводка для лучшей видимости */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{ 
                color: "#fff", 
                weight: route.type === 'geojson' ? 5 : 7, 
                opacity: 0.8 
              }}
            />
            {/* Основная линия */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{ 
                color: route.color, 
                weight: route.type === 'geojson' ? 3 : 5, 
                opacity: 0.9 
              }}
              eventHandlers={{ 
                click: () => handleRouteClick(route.id) 
              }}
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;