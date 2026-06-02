import React, { useCallback, useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet-polylinedecorator';
import 'leaflet-routing-machine';

// =======================
// CAR ICON
// =======================
const createCarIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #e6194b;ф
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
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// =======================
// INTERMEDIATE POINT ICON
// =======================
const intermediatePointIcon = L.divIcon({
  html: `
    <div style="
      width:14px;
      height:14px;
      border-radius:50%;
      background:#2563eb;
      border:2px solid white;
      box-shadow:0 2px 5px rgba(0,0,0,0.35);
    "></div>
  `,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// =======================
// MAP CONTROLLER
// =======================
const MapController = ({ mapRef }) => {
  const map = useMap();

  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  return null;
};

// =======================
// ROUTE ARROWS
// =======================
const RouteArrows = ({ positions, color }) => {
  const map = useMap();
  const decoratorRef = useRef(null);

  useEffect(() => {
    if (!map || !positions || positions.length < 2) return;

    if (decoratorRef.current) {
      map.removeLayer(decoratorRef.current);
    }

    const polyline = L.polyline(positions);

    decoratorRef.current = L.polylineDecorator(polyline, {
      patterns: [
        {
          offset: 25,
          repeat: 60,
          symbol: L.Symbol.arrowHead({
            pixelSize: 9,
            polygon: true,
            pathOptions: {
              color: color || '#2563eb',
              fillOpacity: 1,
              weight: 2
            }
          })
        }
      ]
    });

    decoratorRef.current.addTo(map);

    return () => {
      if (decoratorRef.current) {
        map.removeLayer(decoratorRef.current);
      }
    };
  }, [map, positions, color]);

  return null;
};

// =======================
// ROUTE EDITOR (OSRM + SEAMLESS UPDATE)
// =======================
const RouteEditor = ({ route, selected, editMode, onRouteUpdate }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (routingRef.current) {
      map.removeControl(routingRef.current);
      routingRef.current = null;
    }

    if (!selected || !editMode) return;

    const midIndex = Math.floor(route.coordinates.length / 2);
    const waypoints = [
      route.coordinates[0],
      route.coordinates[midIndex],
      route.coordinates[route.coordinates.length - 1]
    ];

    const control = L.Routing.control({
      waypoints: waypoints.map(p => L.latLng(p[0], p[1])),
      routeWhileDragging: true,
      addWaypoints: true,
      draggableWaypoints: true,
      fitSelectedRoutes: false,
      show: false, // Скрываем текстовую панель инструкций OSRM
      lineOptions: {
        styles: [
          {
            color: route.color,
            weight: 6,
            opacity: 0.8
          }
        ]
      },
      createMarker: function (i, waypoint) {
        return L.marker(waypoint.latLng, {
          draggable: true,
          icon: intermediatePointIcon
        });
      }
    }).addTo(map);

    routingRef.current = control;

    // Вешаем слушатель на успешное построение нового маршрута при перетаскивании точек
    control.on('routesfound', (e) => {
      const routes = e.routes;
      if (routes && routes[0]) {
        // Трансформируем массив Leaflet LatLng объектов обратно в [[lat, lng], ...]
        const newCoords = routes[0].coordinates.map(coord => [coord.lat, coord.lng]);
        onRouteUpdate(route.id, newCoords);
      }
    });

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
    };
  }, [map, selected, editMode, route.id, route.color]); 
  // Намеренно исключаем route.coordinates из зависимостей, чтобы избежать бесконечного цикла ререндера при перетаскивании

  return null;
};

// =======================
// MAIN MAP COMPONENT
// =======================
const MapComponent = ({
  center = [53.9, 27.56],
  zoom = 7,
  districts,
  districtStyle,
  points,
  showPoints,
  onPointSelect,
  routes: initialRoutes = [],
  showRoutes,
  showRoads,
  onRouteClick,
  cars = [],
  onDistrictSelect // опциональный внешний коллбек для района
}) => {
  const mapRef = useRef();
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Локальное состояние для сессионного редактирования маршрутов
  const [localRoutes, setLocalRoutes] = useState(initialRoutes);

  // Синхронизируем локальные маршруты, если внешние пропсы изменились глобально
  useEffect(() => {
    setLocalRoutes(initialRoutes);
  }, [initialRoutes]);

  const tileserverUrl = import.meta.env.VITE_TILESERVER_URL || 'http://localhost:8080';

  const handleRouteSelect = (id) => {
    setSelectedRouteId(id);
    onRouteClick?.(id);
  };

  const handleMarkerClick = useCallback((id) => {
    onPointSelect?.(id);
  }, [onPointSelect]);

  // Функция для обновления координат маршрута в рамках текущей сессии
  const handleRouteUpdate = useCallback((routeId, newCoordinates) => {
    setLocalRoutes(prevRoutes =>
      prevRoutes.map(r => (r.id === routeId ? { ...r, coordinates: newCoordinates } : r))
    );
  }, []);

  // Функция фокуса на районе при клике
  const onEachDistrict = (feature, layer) => {
    layer.on({
      click: (e) => {
        const map = mapRef.current;
        if (map) {
          // Плавно приближаем карту к границам выбранного GeoJSON объекта
          map.fitBounds(e.target.getBounds(), { padding: [20, 20] });
        }
        // Вызываем внешний обработчик, если он передан
        if (onDistrictSelect) {
          onDistrictSelect(feature);
        }
      }
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* КНОПКА РЕДАКТИРОВАНИЯ */}
      {selectedRouteId && (
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            zIndex: 1000,
            background: editMode ? '#dc2626' : '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 18px',
            borderRadius: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            cursor: 'pointer'
          }}
        >
          {editMode ? 'Завершить редактирование' : 'Редактировать маршрут'}
        </button>
      )}

      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef}>
        <MapController mapRef={mapRef} />

        <TileLayer
          url={`${tileserverUrl}/styles/basic-preview/{z}/{x}/{y}.png`}
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* РАЙОНЫ (С ФУНКЦИЕЙ УВЕЛИЧЕНИЯ ПРИ КЛИКЕ) */}
        {districts && (
          <GeoJSON 
            data={districts} 
            style={districtStyle} 
            onEachFeature={onEachDistrict}
          />
        )}

        {/* ТОЧКИ */}
        {showPoints && points?.map(p => (
          <Marker
            key={p.id}
            position={[p.lat, p.lon]}
            eventHandlers={{ click: () => handleMarkerClick(p.id) }}
          >
            <Popup>
              <b>{p.name}</b>
            </Popup>
          </Marker>
        ))}

        {/* МАШИНЫ */}
        {cars?.map(car => (
          <Marker
            key={car.id}
            position={[car.lat, car.lng]}
            icon={createCarIcon()}
          >
            <Popup>
              <b>{car.name}</b>
            </Popup>
          </Marker>
        ))}

        {/* МАРШРУТЫ */}
        {localRoutes.map(route => {
          const selected = selectedRouteId === route.id;

          if (!showRoutes && route.type !== 'geojson') return null;
          if (!showRoads && route.type === 'geojson') return null;

          return (
            <React.Fragment key={route.id}>
              {/* РЕДАКТОР С ДИНАМИЧЕСКИМ СЛУШАТЕЛЕМ ИЗМЕНЕНИЙ */}
              <RouteEditor
                route={route}
                selected={selected}
                editMode={editMode}
                onRouteUpdate={handleRouteUpdate}
              />

              {/* ЛИНИЯ МАРШРУТА */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: route.color,
                  weight: selected ? 6 : 4,
                  opacity: editMode && selected ? 0.35 : 0.95 // делаем бледнее основную линию только у редактируемого объекта, чтобы не перекрывать точки OSRM
                }}
                eventHandlers={{
                  click: () => handleRouteSelect(route.id)
                }}
              />

              {/* СТРЕЛКИ НАПРАВЛЕНИЯ */}
              {!editMode && (
                <RouteArrows
                  positions={route.coordinates}
                  color={route.color}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;