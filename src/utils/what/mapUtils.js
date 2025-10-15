import L from "leaflet";
import axios from "axios";

// загрузка JSON / GeoJSON
export async function loadJSON(url) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error("Ошибка загрузки", url, err);
    return null;
  }
}

// добавление слоя районов
export function addDistrictLayer(map, geoData) {
  L.geoJSON(geoData, {
    style: {
      color: "#3388ff",
      weight: 2,
      opacity: 0.6,
      fillOpacity: 0.1,
    },
  }).addTo(map);
}

// добавление точек
export function addPointsLayer(map, points) {
  if (!points || !Array.isArray(points)) return;
  points.forEach((p) => {
    if (p.lat && p.lng) {
      L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(`<b>${p.name || "Без названия"}</b>`);
    }
  });
}
