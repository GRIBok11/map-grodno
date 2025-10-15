// src/utils/routeUtils.js
export const offsetRoute = (coordinates, offsetMeters) => {
  const offsetCoords = [];
  const R = 6378137; // радиус Земли в метрах

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];

    const dx = lon2 - lon1;
    const dy = lat2 - lat1;
    const length = Math.sqrt(dx * dx + dy * dy);

    // нормализованный вектор, перпендикулярный направлению линии
    const nx = -dy / length;
    const ny = dx / length;

    const offsetLat = (offsetMeters / R) * (180 / Math.PI);
    const offsetLon = offsetLat / Math.cos((lat1 * Math.PI) / 180);

    const newLat = lat1 + ny * offsetLat;
    const newLon = lon1 + nx * offsetLon;

    offsetCoords.push([newLat, newLon]);
  }

  // добавим последнюю точку со смещением в том же направлении
  if (offsetCoords.length > 0) {
    offsetCoords.push(offsetCoords[offsetCoords.length - 1]);
  }

  return offsetCoords;
};

export const downloadGeoJSON = (routes, filename = "routes.geojson") => {
  if (routes.length === 0) {
    alert("Нет маршрутов для сохранения.");
    return;
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
  }));

  const geojson = {
    type: "FeatureCollection",
    features: features
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};