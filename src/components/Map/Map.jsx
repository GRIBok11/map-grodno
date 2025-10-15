// src/components/Map/Map.jsx
import React, { useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet'; // Добавлен useMap

const MapController = ({ mapRef }) => {
  const map = useMap(); // useMap можно использовать только внутри компонента, вложенного в MapContainer
  useEffect(() => {
    mapRef.current = map;
    // window.leafletMap = map; // Опционально, если нужно использовать глобально
  }, [map, mapRef]);
  return null;
};

const Map = ({
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
  onRouteClick
}) => {
  const mapRef = useRef(); // Создаем ref внутри Map.jsx

  const handleMarkerClick = useCallback((pointId) => {
    onPointSelect(pointId);
  }, [onPointSelect]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <MapController mapRef={mapRef} /> {/* Вставляем MapController с ref */}
      <TileLayer
        url="http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png"
      />

      {/* Отображение границ районов */}
      {districts && (
        <GeoJSON
          data={districts}
          style={districtStyle}
        />
      )}

      {/* Отображение точек */}
      {showPoints && points.map(point => (
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

      {/* Отображение маршрутов (рассчитанных и импортированных) */}
      {showRoutes && routes.map(route => (
        route.type !== 'geojson' && (
          <React.Fragment key={route.id}>
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: "#fff", weight: 5, opacity: 1 }}
            />
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: route.color, weight: 3, opacity: 0.8 }}
              eventHandlers={{ click: () => onRouteClick && onRouteClick(route.id) }}
            />
          </React.Fragment>
        )
      ))}

      {/* Отображение дорог (GeoJSON) */}
      {showRoads && routes.map(route => (
        route.type === 'geojson' && (
          <React.Fragment key={route.id}>
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: "#fff", weight: 5, opacity: 1 }}
            />
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: route.color, weight: 3, opacity: 0.8 }}
              eventHandlers={{ click: () => onRouteClick && onRouteClick(route.id) }}
            />
          </React.Fragment>
        )
      ))}
    </MapContainer>
  );
};

export default Map;