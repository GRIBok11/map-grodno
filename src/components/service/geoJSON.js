export const geoJSONService = {
  // Создание GeoJSON для скачивания
  createGeoJSON(routes) {
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

    return {
      type: "FeatureCollection",
      features: features
    };
  },

  // Скачивание GeoJSON
  downloadGeoJSON(routes, filename = "routes.geojson") {
    if (routes.length === 0) {
      throw new Error("Нет маршрутов для сохранения");
    }

    const geojson = this.createGeoJSON(routes);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Парсинг загруженного GeoJSON
  parseUploadedGeoJSON(content) {
    const geojson = JSON.parse(content);
    
    if (geojson.type !== "FeatureCollection") {
      throw new Error("Неверный формат GeoJSON");
    }

    return geojson.features
      .filter(feature => feature.geometry.type === "LineString")
      .map((feature, index) => ({
        name: feature.properties?.name || `Импортированный маршрут ${index + 1}`,
        coordinates: feature.geometry.coordinates.map(coord => [coord[1], coord[0]]), // [lat, lng]
      }));
  }
};