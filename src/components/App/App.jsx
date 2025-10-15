// src/components/App/App.jsx
import React, { useState, useEffect } from 'react';
import { useDataLoader } from '../../hooks/useDataLoader';
import { offsetRoute, downloadGeoJSON as downloadGeoJSONUtil } from '../../utils/routeUtils';
import { loadGroupPoints, loadRoadGroup } from '../../services/dataService.js';
import { loadPointsFromGeoJSON, loadRoutesFromGeoJSON } from '../../services/geojsonService.js';
import MapComponent from '../Map/Map';
import ControlPanel from '../ControlPanel/ControlPanel';
import SidePanel from '../SidePanel/SidePanel';
import PointList from '../PointList/PointList';
import RouteList from '../RouteList/RouteList';
import LoginPage from '../LoginPage/LoginPage'; // Импортируем новый компонент
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Исправление иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png    ',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png    ',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png    ',
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние аутентификации
  const [showLoginPage, setShowLoginPage] = useState(false); // Состояние для отображения страницы входа
  const [points, setPoints] = useState([]);
  const [loadedGroups, setLoadedGroups] = useState(new Set());
  const [routes, setRoutes] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPoints, setShowPoints] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showButtons, setShowButtons] = useState(true);
  const [currentMarkers, setCurrentMarkers] = useState(new Map());
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const [loadedRoadGroups, setLoadedRoadGroups] = useState(new Set());
  const [showRoads, setShowRoads] = useState(true);

  const routeColors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"];
  const [colorIndex, setColorIndex] = useState(0);

  const { districts, groups, roadGroups } = useDataLoader(); // Эти значения могут быть undefined изначально

  const groupColors = {
    "monday.json": "#e6194b",
    "points2.json": "#3cb44b",
  };

  const districtStyle = {
    color: "blue",
    weight: 2,
    fillColor: "lightblue",
    fillOpacity: 0.2,
  };

  const clearMarkers = (pointIds = null) => {
    const markersToDelete = pointIds ? pointIds.map(id => currentMarkers.get(id)).filter(Boolean) : Array.from(currentMarkers.values());
    markersToDelete.forEach(marker => {
      if (window.leafletMap) {
        window.leafletMap.removeLayer(marker);
      }
    });
    if (pointIds) {
      const newMarkers = new Map(currentMarkers);
      pointIds.forEach(id => newMarkers.delete(id));
      setCurrentMarkers(newMarkers);
    } else {
      setCurrentMarkers(new Map());
    }
  };

  const loadGroupPointsHandler = async (file) => {
    if (!file || loadedGroups.has(file) || !groups) {
      if (loadedGroups.has(file)) {
        alert(`Группа "${file}" уже загружена.`);
      }
      return;
    }

    try {
      const pointsData = await loadGroupPoints(file);
      const pointsWithGroup = pointsData.map(p => ({ ...p, group: file }));
      setPoints(prev => [...prev, ...pointsWithGroup]);
      setLoadedGroups(prev => new Set(prev).add(file));
    } catch (error) {
      console.error("Ошибка загрузки точек:", error);
    }
  };

  const removeGroupPointsHandler = (file) => {
    if (!loadedGroups.has(file)) {
      alert(`Группа "${file}" не загружена.`);
      return;
    }

    const pointsToRemove = points.filter(p => p.group === file).map(p => p.id);
    setPoints(prev => prev.filter(p => p.group !== file));
    clearMarkers(pointsToRemove);
    setLoadedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(file);
      return newSet;
    });
  };

  const loadRoadGroupHandler = async (file) => {
    if (!file || loadedRoadGroups.has(file) || !roadGroups) {
      if (loadedRoadGroups.has(file)) {
         alert(`Группа дорог "${file}" уже загружена.`);
      }
      return;
    }

    try {
      const color = routeColors[colorIndex % routeColors.length];
      const roadsData = await loadRoadGroup(file);
      const newRoutes = roadsData.features
        .filter(feature => feature.geometry.type === "LineString")
        .map((feature, index) => {
          const coords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
          const name = feature.properties?.name || `Дорога ${index + 1}`;
          const baseWeight = 3;
          const weight = Math.max(1, baseWeight - (loadedRoadGroups.size + 1));
          return {
            id: `${file.replace('.geojson', '')}-${index}`,
            name,
            coordinates: coords,
            color: color,
            weight: weight,
            type: 'geojson',
            group: file
          };
        });
      setRoutes(prev => [...prev, ...newRoutes]);
      setLoadedRoadGroups(prev => new Set(prev).add(file));
      setColorIndex(prev => prev + 1);
    } catch (error) {
      console.error("Ошибка загрузки дорог:", error);
    }
  };

  const removeRoadGroupHandler = (file) => {
    if (!loadedRoadGroups.has(file)) {
      alert(`Группа дорог "${file}" не загружена.`);
      return;
    }

    setRoutes(prev => prev.filter(route => route.group !== file));
    setLoadedRoadGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(file);
      return newSet;
    });
  };

  const clearRoads = () => {
     setRoutes(prev => prev.filter(route => route.type !== 'geojson'));
     setLoadedRoadGroups(new Set());
  };

  const buildRoute = () => {
    if (selectedPoints.length !== 2) {
      alert("Выберите ровно две точки.");
      return;
    }

    const point1 = points.find(p => p.id === selectedPoints[0]);
    const point2 = points.find(p => p.id === selectedPoints[1]);

    if (!point1 || !point2) return;

    const color = groupColors[point1.group] || routeColors[colorIndex % routeColors.length];
    const newColorIndex = colorIndex + 1;
    setColorIndex(newColorIndex);

    const intermediatePoints = [
      [point1.lat, point1.lon],
      [point1.lat + (point2.lat - point1.lat) * 0.3, point1.lon + (point2.lon - point1.lon) * 0.3],
      [point1.lat + (point2.lat - point1.lat) * 0.7, point1.lon + (point2.lon - point1.lon) * 0.7],
      [point2.lat, point2.lon]
    ];

    const offset = 0.001 * (routes.length + 1);
    const shiftedCoordinates = offsetRoute(intermediatePoints, offset);

    const newRoute = {
      id: Date.now(),
      name: `${point1.name} → ${point2.name}`,
      coordinates: shiftedCoordinates.length > 0 ? shiftedCoordinates : intermediatePoints,
      color: color,
      weight: 3,
      type: 'calculated'
    };

    setRoutes(prev => [...prev, newRoute]);
    setSelectedPoints([]);
  };

  const clearRoutes = () => {
    setRoutes([]);
    setSelectedPoints([]);
    setColorIndex(0);
  };

  const downloadGeoJSON = () => {
    downloadGeoJSONUtil(routes);
  };

  const handlePointsGeoJSONUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const geojson = JSON.parse(e.target.result);
        const newPoints = loadPointsFromGeoJSON(geojson).map(p => ({ ...p, group: 'imported-geojson' }));
        setPoints(prev => [...prev, ...newPoints]);
        alert(`Успешно загружено ${newPoints.length} точек из GeoJSON.`);
      } catch (err) {
        alert("Ошибка при чтении GeoJSON файла: " + err.message);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleGeoJSONUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const color = routeColors[colorIndex % routeColors.length];
    const newColorIndex = colorIndex + 1;
    setColorIndex(newColorIndex);

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const geojson = JSON.parse(e.target.result);
        const newRoutes = loadRoutesFromGeoJSON(geojson, color).map(r => ({...r, group: 'imported-geojson'}));
        setRoutes(prev => [...prev, ...newRoutes]);
        alert("Маршруты успешно загружены.");
      } catch (err) {
        alert("Ошибка при чтении GeoJSON: " + err.message);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredPoints = points.filter(point =>
    point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    point.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePointSelect = (pointId) => {
    if (selectedPoints.includes(pointId)) {
      setSelectedPoints(selectedPoints.filter(id => id !== pointId));
    } else {
      if (selectedPoints.length < 2) {
        setSelectedPoints([...selectedPoints, pointId]);
      } else {
        alert('Можно выбрать только две точки для построения маршрута');
      }
    }
  };

  // Функция для входа
  const handleLogin = (username) => {
    // Здесь можно сохранить токен или данные пользователя, например, в localStorage или в контексте
    // localStorage.setItem('user', JSON.stringify({ username }));
    setIsAuthenticated(true);
    setShowLoginPage(false); // Скрываем страницу входа после успешного входа
  };

  // Функция для открытия страницы входа
  const openLoginPage = () => {
    setShowLoginPage(true);
  };

  // Функция для выхода
  const handleLogout = () => {
    // localStorage.removeItem('user');
    setIsAuthenticated(false);
    // setShowLoginPage(false); // Не скрываем, а показываем снова, если нужно
  };

  // Проверяем, загружены ли данные перед рендером (только если аутентифицированы)
  if (!groups || !roadGroups) {
    return <div>Загрузка данных...</div>;
  }

  // Если нужно показать страницу входа
  if (showLoginPage) {
    return <LoginPage onLogin={handleLogin} onGoToMainApp={() => setShowLoginPage(false)} />;
  }

  return (
    <div className="app">
      <ControlPanel
        groups={groups}
        loadedGroups={Array.from(loadedGroups)}
        onGroupAdd={loadGroupPointsHandler}
        onGroupRemove={removeGroupPointsHandler}
        roadGroups={roadGroups}
        loadedRoadGroups={Array.from(loadedRoadGroups)}
        onRoadGroupAdd={loadRoadGroupHandler}
        onRoadGroupRemove={removeRoadGroupHandler}
        onRoadsClear={clearRoads}
        showPoints={showPoints}
        setShowPoints={setShowPoints}
        showRoutes={showRoutes}
        setShowRoutes={setShowRoutes}
        showRoads={showRoads}
        setShowRoads={setShowRoads}
        showButtons={showButtons}
        setShowButtons={setShowButtons}
        buildRoute={buildRoute}
        clearRoutes={clearRoutes}
        downloadGeoJSON={downloadGeoJSON}
        handleGeoJSONUpload={handleGeoJSONUpload}
        isSidePanelOpen={showButtons}
        toggleSidePanel={() => setShowButtons(!showButtons)}
        handlePointsGeoJSONUpload={handlePointsGeoJSONUpload}
        onLogout={handleLogout}
        onOpenLogin={openLoginPage} // Передаем функцию открытия страницы входа
        isAuthenticated={isAuthenticated} // Передаем состояние аутентификации
      />

      <div className="map-container">
        <MapComponent
          districts={districts}
          districtStyle={districtStyle}
          points={points}
          showPoints={showPoints}
          selectedPoints={selectedPoints}
          onPointSelect={handlePointSelect}
          routes={routes}
          showRoutes={showRoutes}
          showRoads={showRoads}
          currentMarkers={currentMarkers}
          setCurrentMarkers={setCurrentMarkers}
        />
      </div>

    
<SidePanel
  isOpen={showButtons}
  onClose={() => setShowButtons(false)}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  loadedGroups={Array.from(loadedGroups)}
  onGroupRemove={removeGroupPointsHandler}
  loadedRoadGroups={Array.from(loadedRoadGroups)}
  onRoadGroupRemove={removeRoadGroupHandler}
  onRoadsClear={clearRoads}
  points={points}
  routes={routes}
  selectedPoints={selectedPoints}
  onPointSelect={handlePointSelect}
>
  {/* Дополнительный контент если нужен */}
</SidePanel>
    </div>
  );
};

export default App;