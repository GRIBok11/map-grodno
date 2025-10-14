import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ControlPanel from './components/ControlPanel'
import SidePanel from "./components/SidePanel";
import PointList from './components/PointList'
import RouteList from './components/RouteList'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [points, setPoints] = useState([])
  const [routes, setRoutes] = useState([])
  const [selectedPoints, setSelectedPoints] = useState([])
  const [currentGroup, setCurrentGroup] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPoints, setShowPoints] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showButtons, setShowButtons] = useState(true)
  const [groups, setGroups] = useState([])
  const [currentMarkers, setCurrentMarkers] = useState([])
  const [districts, setDistricts] = useState(null)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true)
  
  // Добавьте эти состояния для дорог
  const [roadGroups, setRoadGroups] = useState([])
  const [currentRoadGroup, setCurrentRoadGroup] = useState('')
  const [showRoads, setShowRoads] = useState(true)
  
  const routeColors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"]
  const [colorIndex, setColorIndex] = useState(0)
  
  const mapRef = useRef()

  const groupColors = {
    "monday.json": "#e6194b",
    "points2.json": "#3cb44b",
  }

  // Функция для смещения маршрутов
  const offsetRoute = (coordinates, offsetMeters) => {
    const offsetCoords = []
    const R = 6378137 // радиус Земли в метрах

    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lat1, lon1] = coordinates[i]
      const [lat2, lon2] = coordinates[i + 1]

      const dx = lon2 - lon1
      const dy = lat2 - lat1
      const length = Math.sqrt(dx * dx + dy * dy)

      // нормализованный вектор, перпендикулярный направлению линии
      const nx = -dy / length
      const ny = dx / length

      const offsetLat = (offsetMeters / R) * (180 / Math.PI)
      const offsetLon = offsetLat / Math.cos((lat1 * Math.PI) / 180)

      const newLat = lat1 + ny * offsetLat
      const newLon = lon1 + nx * offsetLon

      offsetCoords.push([newLat, newLon])
    }

    // добавим последнюю точку со смещением в том же направлении
    if (offsetCoords.length > 0) {
      offsetCoords.push(offsetCoords[offsetCoords.length - 1])
    }

    return offsetCoords
  }

  // Стиль для районов
  const districtStyle = {
    color: "blue",
    weight: 2,
    fillColor: "lightblue",
    fillOpacity: 0.2,
  }

  // Загрузка границ районов
  const loadDistricts = async () => {
    try {
      const response = await fetch("/data/grodno.json")
      const data = await response.json()
      setDistricts(data)
    } catch (error) {
      console.error("Ошибка загрузки границ районов:", error)
    }
  }

  // Загрузка списка групп точек
  const fetchGroupList = async () => {
    try {
      const response = await fetch("/data/points/index.json")
      const files = await response.json()
      setGroups(files)
    } catch (error) {
      console.error("Ошибка загрузки списка групп:", error)
    }
  }

  // Загрузка списка групп дорог
  const fetchRoadGroupList = async () => {
    try {
      const response = await fetch("/data/roads/index.json")
      const files = await response.json()
      setRoadGroups(files)
    } catch (error) {
      console.error("Ошибка загрузки списка групп дорог:", error)
    }
  }

  // Загрузка точек выбранной группы
  const loadGroupPoints = async (file) => {
    if (!file) return
    
    try {
      const response = await fetch(`/data/points/${file}`)
      const pointsData = await response.json()
      
      // Очищаем предыдущие маркеры
      clearMarkers()
      
      setPoints(pointsData.map((point, index) => ({
        ...point,
        id: index,
        name: point.description?.["Наименование"] || point.address || "Без названия",
        address: point.address || "Без адреса"
      })))
      
      // Добавляем маркеры на карту
      const newMarkers = pointsData.map((point, index) => {
        const marker = L.marker([point.lat, point.lon]).addTo(mapRef.current)
        const name = point.description?.["Наименование"] || point.address || "Без названия"
        const address = point.address || "Без адреса"
        
        marker.bindPopup(`<b>${name}</b><br>${address}`)
        return marker
      })
      
      setCurrentMarkers(newMarkers)
      setCurrentGroup(file)
    } catch (error) {
      console.error("Ошибка загрузки точек:", error)
    }
  }

  // Загрузка дорог выбранной группы
  const loadRoadGroup = async (file) => {
    if (!file) {
      // Очищаем только дороги типа 'geojson'
      setRoutes(prev => prev.filter(route => route.type !== 'geojson'))
      setCurrentRoadGroup('')
      return
    }
    
    try {
      // Очищаем предыдущие дороги (только те, что загружены из GeoJSON)
      setRoutes(prev => prev.filter(route => route.type !== 'geojson'))
      
      const color = routeColors[colorIndex % routeColors.length]
      await loadRoutes(file.replace('.geojson', ''), color)
      setCurrentRoadGroup(file)
      
      // Увеличиваем индекс цвета для следующей группы
      setColorIndex(prev => prev + 1)
    } catch (error) {
      console.error("Ошибка загрузки дорог:", error)
    }
  }

  // Очистка маркеров
  const clearMarkers = () => {
    currentMarkers.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker)
      }
    })
    setCurrentMarkers([])
  }

  // Загрузка маршрутов из GeoJSON
  const loadRoutes = async (fileName, color) => {
    try {
      const response = await fetch(`/data/roads/${fileName}.geojson`)
      const roads = await response.json()
      
      const newRoutes = roads.features
        .filter(feature => feature.geometry.type === "LineString")
        .map((feature, index) => {
          const coords = feature.geometry.coordinates.map(c => [c[1], c[0]])
          const name = feature.properties?.name || `Дорога ${index + 1}`
          
          return {
            id: `${fileName}-${index}`,
            name,
            coordinates: coords,
            color: color,
            weight: 2,
            type: 'geojson'
          }
        })
      
      setRoutes(prev => [...prev, ...newRoutes])
    } catch (error) {
      console.error(`Ошибка загрузки маршрутов для ${fileName}:`, error)
    }
  }

  // Построение маршрута между двумя точками
  const buildRoute = () => {
    if (selectedPoints.length !== 2) {
      alert("Выберите ровно две точки.")
      return
    }

    const point1 = points.find(p => p.id === selectedPoints[0])
    const point2 = points.find(p => p.id === selectedPoints[1])
    
    if (!point1 || !point2) return

    const color = groupColors[currentGroup] || routeColors[colorIndex % routeColors.length]
    const newColorIndex = colorIndex + 1
    setColorIndex(newColorIndex)

    // Создаем промежуточные точки для имитации маршрута
    const intermediatePoints = [
      [point1.lat, point1.lon],
      [point1.lat + (point2.lat - point1.lat) * 0.3, point1.lon + (point2.lon - point1.lon) * 0.3],
      [point1.lat + (point2.lat - point1.lat) * 0.7, point1.lon + (point2.lon - point1.lon) * 0.7],
      [point2.lat, point2.lon]
    ]

    // Применяем смещение к маршруту
    const offset = 0.001 * (routes.length + 1) // 0.001 градуса на каждый маршрут (примерно 100 метров)
    const shiftedCoordinates = offsetRoute(intermediatePoints, offset)

    const newRoute = {
      id: Date.now(),
      name: `${point1.name} → ${point2.name}`,
      coordinates: shiftedCoordinates.length > 0 ? shiftedCoordinates : intermediatePoints,
      color: color,
      weight: 2,
      type: 'calculated'
    }

    setRoutes(prev => [...prev, newRoute])
    setSelectedPoints([])
  }

  // Очистка маршрутов
  const clearRoutes = () => {
    setRoutes([])
    setSelectedPoints([])
    setColorIndex(0)
  }

  // Скачивание GeoJSON
  const downloadGeoJSON = () => {
    if (routes.length === 0) {
      alert("Нет маршрутов для сохранения.")
      return
    }

    const features = routes.map(route => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route.coordinates.map(coord => [coord[1], coord[0]]) // [lng, lat]
      },
      properties: {
        name: route.name
      }
    }))

    const geojson = {
      type: "FeatureCollection",
      features: features
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "routes.geojson"
    a.click()
    URL.revokeObjectURL(url)
  }
  // Функция для загрузки точек из GeoJSON
const loadPointsFromGeoJSON = (geojsonData) => {
  try {
    if (geojsonData.type !== "FeatureCollection") {
      alert("Неверный формат GeoJSON. Ожидается FeatureCollection.")
      return
    }

    const newPoints = geojsonData.features
      .filter(feature => feature.geometry.type === "Point")
      .map((feature, index) => {
        const [lon, lat] = feature.geometry.coordinates
        const properties = feature.properties || {}
        
        return {
          id: `geojson-${Date.now()}-${index}`,
          lat: lat,
          lon: lon,
          name: properties.name || properties.full_name || `Точка ${index + 1}`,
          address: properties.full_name || properties.name || "Без названия",
          description: properties,
          type: 'geojson'
        }
      })

    if (newPoints.length === 0) {
      alert("В файле не найдены точки (Point features).")
      return
    }

    // Очищаем предыдущие маркеры
    clearMarkers()
    
    // Добавляем новые точки
    setPoints(newPoints)
    
    // Добавляем маркеры на карту
    const newMarkers = newPoints.map((point, index) => {
      const marker = L.marker([point.lat, point.lon]).addTo(mapRef.current)
      marker.bindPopup(`<b>${point.name}</b><br>${point.address}`)
      return marker
    })
    
    setCurrentMarkers(newMarkers)
    setCurrentGroup('imported-geojson')
    alert(`Успешно загружено ${newPoints.length} точек из GeoJSON.`)
    
  } catch (error) {
    console.error("Ошибка загрузки точек из GeoJSON:", error)
    alert("Ошибка при чтении GeoJSON файла: " + error.message)
  }
}

// Обработчик загрузки GeoJSON файла с точками
const handlePointsGeoJSONUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = function(e) {
    try {
      const geojson = JSON.parse(e.target.result)
      loadPointsFromGeoJSON(geojson)
    } catch (err) {
      alert("Ошибка при чтении GeoJSON файла: " + err.message)
    }
  }

  reader.readAsText(file)
  event.target.value = ''
}

  // Загрузка GeoJSON
  const handleGeoJSONUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const color = routeColors[colorIndex % routeColors.length]
    const newColorIndex = colorIndex + 1
    setColorIndex(newColorIndex)

    const reader = new FileReader()
    reader.onload = function(e) {
      try {
        const geojson = JSON.parse(e.target.result)
        if (geojson.type !== "FeatureCollection") {
          alert("Неверный формат GeoJSON.")
          return
        }

        const newRoutes = geojson.features
          .filter(feature => feature.geometry.type === "LineString")
          .map((feature, index) => ({
            id: `imported-${Date.now()}-${index}`,
            name: feature.properties?.name || `Импортированный маршрут ${index + 1}`,
            coordinates: feature.geometry.coordinates.map(coord => [coord[1], coord[0]]), // [lat, lng]
            color: color,
            type: 'imported'
          }))

        setRoutes(prev => [...prev, ...newRoutes])
        alert("Маршруты успешно загружены.")
      } catch (err) {
        alert("Ошибка при чтении GeoJSON: " + err.message)
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  // Фильтрация точек
  const filteredPoints = points.filter(point => 
    point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    point.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Инициализация при загрузке
  useEffect(() => {
    loadDistricts()
    fetchGroupList()
    fetchRoadGroupList() // Добавьте эту строку
  }, [])

  // Компонент для инициализации карты
  const MapController = () => {
    const map = useMap()
    mapRef.current = map
    return null
  }

  return (
    <div className="app">
      {/* Верхняя панель управления - только управляющие элементы */}
      <ControlPanel
        handlePointsGeoJSONUpload={handlePointsGeoJSONUpload}
        groups={groups}
        currentGroup={currentGroup}
        onGroupChange={loadGroupPoints}
        roadGroups={roadGroups}
        currentRoadGroup={currentRoadGroup}
        onRoadGroupChange={loadRoadGroup}
        showPoints={showPoints}
        setShowPoints={setShowPoints}
        showRoutes={showRoutes}
        setShowRoutes={setShowRoutes}
        showRoads={showRoads}
        setShowRoads={setShowRoads}
        showButtons={showButtons}
        setShowButtons={setShowButtons}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        buildRoute={buildRoute}
        clearRoutes={clearRoutes}
        downloadGeoJSON={downloadGeoJSON}
        handleGeoJSONUpload={handleGeoJSONUpload}
        isSidePanelOpen={isSidePanelOpen}
        toggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
      />

      <div className="map-container">
        <MapContainer
          center={[53.9, 27.56]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController />
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
                click: () => {
                  if (selectedPoints.includes(point.id)) {
                    setSelectedPoints(selectedPoints.filter(id => id !== point.id))
                  } else {
                    if (selectedPoints.length < 2) {
                      setSelectedPoints([...selectedPoints, point.id])
                    } else {
                      alert('Можно выбрать только две точки для построения маршрута')
                    }
                  }
                }
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
                {/* Белая подложка */}
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{ color: "#fff", weight: 3, opacity: 0 }}
                />
                {/* Основной цвет */}
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{ color: route.color, weight: 3, opacity: 0.5 }}
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
                  pathOptions={{ color: "#fff", weight: 5, opacity: 0 }}
                />
                <Polyline
                  positions={route.coordinates}
                  pathOptions={{ color: route.color, weight: 3, opacity: 0.7 }}
                />
              </React.Fragment>
            )
          ))}
        </MapContainer>
      </div>

      <SidePanel isOpen={isSidePanelOpen}>
        <>
          <PointList 
            points={filteredPoints}
            selectedPoints={selectedPoints}
            onPointSelect={(pointId) => {
              if (selectedPoints.includes(pointId)) {
                setSelectedPoints(selectedPoints.filter(id => id !== pointId))
              } else {
                if (selectedPoints.length < 2) {
                  setSelectedPoints([...selectedPoints, pointId])
                } else {
                  alert('Можно выбрать только две точки для построения маршрута')
                }
              }
            }}
            visible={showPoints}
          />
          
          <RouteList 
            routes={routes}
            visible={showRoutes}
          />
        </>
      </SidePanel>
    </div>
  )
}

export default App