// src/components/App/App.jsx
import React, { useState, useEffect } from 'react';
import { useDataLoader } from '../../hooks/useDataLoader';
import { offsetRoute, downloadGeoJSON as downloadGeoJSONUtil } from '../../utils/routeUtils';
import { loadGroupPoints, loadRoadGroup } from '../../services/dataService.js';
import { loadPointsFromGeoJSON, loadRoutesFromGeoJSON } from '../../services/geojsonService.js';
import MapComponent from '../Map/Map'; // Изменили импорт
import ControlPanel from '../ControlPanel/ControlPanel';
import SidePanel from '../SidePanel/SidePanel';
import PointList from '../PointList/PointList';
import RouteList from '../RouteList/RouteList';
import LoginPage from '../LoginPage/LoginPage';
import { useWebSocket } from '../../hooks/useWebSocket';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Исправление иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Словарь дней недели для использования в логике
const WEEK_DAYS = {
  "понедельник": "Понедельник",
  "вторник": "Вторник",
  "среда": "Среда",
  "четверг": "Четверг",
  "пятница": "Пятница",
  "суббота": "Суббота",
  "воскресенье": "Воскресенье",
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [showLoginPage, setShowLoginPage] = useState(false); 
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
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [loadedRoadGroups, setLoadedRoadGroups] = useState(new Set());
  const [showRoads, setShowRoads] = useState(true);

  // Новые состояния для управления видимостью
  const [hiddenDays, setHiddenDays] = useState({});
  const [hiddenGroups, setHiddenGroups] = useState({});

  // Используем WebSocket хук
  const { cars, isConnected } = useWebSocket();

  const routeColors = ["#e6194b", "#911eb4", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"];
  const [colorIndex, setColorIndex] = useState(0);

  const { districts, groups, roadGroups } = useDataLoader();

  const groupColors = {
    "понедельник.json": "#e6194b",
    "понедельник2.json": "#3cb44b",
  };
  
  const districtsList = [
    "Гродненская область",
    "Берестовицкий район",
    "Волковысский район", 
    "Вороновский район",
    "Гродненский район",
    "Дятловский район",
    "Зельвенский район",
    "Ивьевский район",
    "Кореличский район",
    "Лидский район",
    "Мостовский район",
    "Новогрудский район",
    "Ошмянский район",
    "Островецкий район",
    "Свислочский район",
    "Слонимский район",
    "Сморгонский район",
    "Щучинский район"
  ];

  const districtCenters = {
    "Гродненская область": [53.6884, 25.3280],
    "Берестовицкий район": [53.1944, 24.0178],
    "Волковысский район": [53.1631, 24.4517],
    "Вороновский район": [54.1500, 25.3167],
    "Гродненский район": [53.6884, 23.8258],
    "Дятловский район": [53.4631, 25.4017],
    "Зельвенский район": [53.1469, 24.8167],
    "Ивьевский район": [53.9292, 25.7722],
    "Кореличский район": [53.5683, 26.1375],
    "Лидский район": [53.8872, 25.3025],
    "Мостовский район": [53.4083, 24.5389],
    "Новогрудский район": [53.5964, 25.8225],
    "Ошмянский район": [54.4253, 25.9358],
    "Островецкий район": [54.6128, 25.9553],
    "Свислочский район": [52.9822, 24.0967],
    "Слонимский район": [53.0931, 25.3167],
    "Сморгонский район": [54.4819, 26.4000],
    "Щучинский район": [53.6014, 24.7389]
  };

  // Автоматическая загрузка всех групп при инициализации
  useEffect(() => {
    if (groups && groups.length > 0) {
      loadAllGroupsAutomatically();
    }
  }, [groups]);

  // Автоматическая загрузка всех дорожных групп при инициализации
  useEffect(() => {
    if (roadGroups && roadGroups.length > 0) {
      loadAllRoadGroupsAutomatically();
    }
  }, [roadGroups]);

  // Функция для автоматической загрузки всех групп точек
  const loadAllGroupsAutomatically = async () => {
    if (!groups || groups.length === 0) return;

    try {
      const allPoints = [];
      const newLoadedGroups = new Set();
      const newHiddenGroups = { ...hiddenGroups };

      for (const file of groups) {
        try {
          const pointsData = await loadGroupPoints(file);
          const pointsWithGroup = pointsData.map(p => ({ ...p, group: file }));
          allPoints.push(...pointsWithGroup);
          newLoadedGroups.add(file);
        } catch (error) {
          console.error(`Ошибка загрузки группы ${file}:`, error);
        }
      }

      setPoints(prev => [...prev, ...allPoints]);
      setLoadedGroups(newLoadedGroups);
      setHiddenGroups(newHiddenGroups);
      
      console.log(`Автоматически загружено ${allPoints.length} точек из ${groups.length} групп`);
    } catch (error) {
      console.error("Ошибка автоматической загрузки групп:", error);
    }
  };

  // Функция для автоматической загрузки всех дорожных групп
  const loadAllRoadGroupsAutomatically = async () => {
    if (!roadGroups || roadGroups.length === 0) return;

    try {
      const allRoutes = [];
      const newLoadedRoadGroups = new Set();
      const newHiddenGroups = { ...hiddenGroups };
      let currentColorIndex = colorIndex;

      for (const file of roadGroups) {
        try {
          const color = routeColors[currentColorIndex % routeColors.length];
          const roadsData = await loadRoadGroup(file);
          const newRoutes = roadsData.features
            .filter(feature => feature.geometry.type === "LineString")
            .map((feature, index) => {
              const coords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
              const name = feature.properties?.name || `Дорога ${index + 1}`;
              const baseWeight = 3;
              const weight = Math.max(1, baseWeight - (newLoadedRoadGroups.size + 1));
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

          allRoutes.push(...newRoutes);
          newLoadedRoadGroups.add(file);
          currentColorIndex++;
        } catch (error) {
          console.error(`Ошибка загрузки дорожной группы ${file}:`, error);
        }
      }

      setRoutes(prev => [...prev, ...allRoutes]);
      setLoadedRoadGroups(newLoadedRoadGroups);
      setHiddenGroups(newHiddenGroups);
      setColorIndex(currentColorIndex);
      
      console.log(`Автоматически загружено ${allRoutes.length} маршрутов из ${roadGroups.length} групп`);
    } catch (error) {
      console.error("Ошибка автоматической загрузки дорожных групп:", error);
    }
  };

  // Функция для определения дня недели из названия файла
  const getDayFromFileName = (fileName) => {
    const lowerName = fileName.toLowerCase();
    for (const [dayKey, dayName] of Object.entries(WEEK_DAYS)) {
      if (lowerName.includes(dayKey)) {
        return dayName;
      }
    }
    return "Другое";
  };

  // Получить все группы, относящиеся к определенному дню
  const getGroupsByDay = (day) => {
    const allGroups = new Set();
    
    // Добавляем группы точек
    points.forEach(point => {
      const pointDay = getDayFromFileName(point.group);
      if (pointDay === day) {
        allGroups.add(point.group);
      }
    });
    
    // Добавляем группы маршрутов
    routes.forEach(route => {
      const routeDay = getDayFromFileName(route.group);
      if (routeDay === day) {
        allGroups.add(route.group);
      }
    });
    
    return Array.from(allGroups);
  };

  // Функции для управления видимостью дней
  const handleToggleDayVisibility = (day) => {
    setHiddenDays(prev => {
      const newHiddenDays = {
        ...prev,
        [day]: !prev[day]
      };
      
      // Если скрываем день, скрываем все группы в нем
      if (!prev[day]) {
        const groupsInDay = getGroupsByDay(day);
        const newHiddenGroups = { ...hiddenGroups };
        groupsInDay.forEach(group => {
          newHiddenGroups[group] = true;
        });
        setHiddenGroups(newHiddenGroups);
      }
      // Если показываем день, показываем все группы в нем
      else {
        const groupsInDay = getGroupsByDay(day);
        const newHiddenGroups = { ...hiddenGroups };
        groupsInDay.forEach(group => {
          newHiddenGroups[group] = false;
        });
        setHiddenGroups(newHiddenGroups);
      }
      
      return newHiddenDays;
    });
  };

  // Функции для управления видимостью групп
  const handleToggleGroupVisibility = (group) => {
    setHiddenGroups(prev => {
      const newHiddenGroups = {
        ...prev,
        [group]: !prev[group]
      };
      
      // Проверяем, нужно ли обновить состояние дня
      const day = getDayFromFileName(group);
      const groupsInDay = getGroupsByDay(day);
      
      // Если все группы дня скрыты - скрываем день
      const allGroupsHidden = groupsInDay.every(g => newHiddenGroups[g]);
      // Если хотя бы одна группа видима - показываем день
      const anyGroupVisible = groupsInDay.some(g => !newHiddenGroups[g]);
      
      setHiddenDays(prevDays => ({
        ...prevDays,
        [day]: allGroupsHidden
      }));
      
      return newHiddenGroups;
    });
  };

  // Функция для получения видимых точек (фильтрует скрытые группы)
  const getVisiblePoints = () => {
    return points.filter(point => !hiddenGroups[point.group]);
  };

  // Функция для получения видимых маршрутов (фильтрует скрытые группы)
  const getVisibleRoutes = () => {
    return routes.filter(route => !hiddenGroups[route.group]);
  };

  const handleDistrictSelect = (districtName) => {
    setSelectedDistrict(districtName);
    
    const center = districtCenters[districtName];
    if (center && window.leafletMap) {
      if (districtName === "Гродненская область") {
        window.leafletMap.setView(center, 8);
      } else {
        window.leafletMap.setView(center, 10);
      }
    }
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
      setHiddenGroups(prev => ({
        ...prev,
        [file]: false
      }));
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
    setHiddenGroups(prev => {
      const newHidden = { ...prev };
      delete newHidden[file];
      return newHidden;
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
      setHiddenGroups(prev => ({
        ...prev,
        [file]: false
      }));
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
    setHiddenGroups(prev => {
      const newHidden = { ...prev };
      delete newHidden[file];
      return newHidden;
    });
  };

  const clearRoads = () => {
    setRoutes(prev => prev.filter(route => route.type !== 'geojson'));
    setLoadedRoadGroups(new Set());
    setHiddenGroups(prev => {
      const newHidden = { ...prev };
      Object.keys(newHidden).forEach(group => {
        if (group.endsWith('.geojson')) {
          delete newHidden[group];
        }
      });
      return newHidden;
    });
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

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setShowLoginPage(false);
  };

  const openLoginPage = () => {
    setShowLoginPage(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!groups || !roadGroups) {
    return <div>Загрузка данных...</div>;
  }

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
  clearRoutes={clearRoutes}
  downloadGeoJSON={downloadGeoJSON}
  handleGeoJSONUpload={handleGeoJSONUpload}
  isSidePanelOpen={showButtons}
  toggleSidePanel={() => setShowButtons(!showButtons)}
  handlePointsGeoJSONUpload={handlePointsGeoJSONUpload}
  onLogout={handleLogout}
  onOpenLogin={openLoginPage}
  isAuthenticated={isAuthenticated}
  districtsList={districtsList}
  selectedDistrict={selectedDistrict}
  onDistrictSelect={handleDistrictSelect} 
  isWebSocketConnected={isConnected}
  carsCount={cars.length}
/>
      

      <div className="map-container">
        <MapComponent
          districts={districts}
          districtStyle={districtStyle}
          points={getVisiblePoints()}
          showPoints={showPoints}
          selectedPoints={selectedPoints}
          routes={getVisibleRoutes()}
          showRoutes={showRoutes}
          showRoads={showRoads}
          // Передаем машинки на карту
          cars={cars}
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
        onToggleDayVisibility={handleToggleDayVisibility}
        onToggleGroupVisibility={handleToggleGroupVisibility}
        hiddenDays={hiddenDays}
        hiddenGroups={hiddenGroups}
        cars={cars}
        isWebSocketConnected={isConnected}
      />
    </div>
  );
};

export default App;