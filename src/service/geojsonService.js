// src/services/geojsonService.js
export const loadPointsFromGeoJSON = (geojsonData) => {
  if (geojsonData.type !== "FeatureCollection") {
    throw new Error("Неверный формат GeoJSON. Ожидается FeatureCollection.");
  }

  const newPoints = geojsonData.features
    .filter(feature => feature.geometry.type === "Point")
    .map((feature, index) => {
      const [lon, lat] = feature.geometry.coordinates;
      const properties = feature.properties || {};

      return {
        id: `geojson-${Date.now()}-${index}`,
        lat: lat,
        lon: lon,
        name: properties.name || properties.full_name || `Точка ${index + 1}`,
        address: properties.full_name || properties.name || "Без названия",
        description: properties,
        type: 'geojson'
      };
    });

  if (newPoints.length === 0) {
    throw new Error("В файле не найдены точки (Point features).");
  }

  return newPoints;
};

export const loadRoutesFromGeoJSON = (geojsonData, color) => {
  if (geojsonData.type !== "FeatureCollection") {
    throw new Error("Неверный формат GeoJSON.");
  }

  return geojsonData.features
    .filter(feature => feature.geometry.type === "LineString")
    .map((feature, index) => ({
      id: `imported-${Date.now()}-${index}`,
      name: feature.properties?.name || `Импортированный маршрут ${index + 1}`,
      coordinates: feature.geometry.coordinates.map(coord => [coord[1], coord[0]]), // [lat, lng]
      color: color,
      weight: 2,
      type: 'imported'
    }));
};