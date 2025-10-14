const API_BASE = '/data';

export const apiService = {
  // Загрузка границ районов
  async loadDistricts() {
    const response = await fetch(`${API_BASE}/grodno.json`);
    return await response.json();
  },

  // Загрузка списка групп точек
  async loadGroups() {
    const response = await fetch(`${API_BASE}/points/index.json`);
    return await response.json();
  },

  // Загрузка точек конкретной группы
  async loadGroupPoints(file) {
    const response = await fetch(`${API_BASE}/points/${file}`);
    const points = await response.json();
    
    return points.map((point, index) => ({
      ...point,
      id: index,
      name: point.description?.["Наименование"] || point.address || "Без названия",
      address: point.address || "Без адреса"
    }));
  },

  // Загрузка маршрутов
  async loadRoutes(fileName) {
    const response = await fetch(`${API_BASE}/roads/${fileName}.geojson`);
    return await response.json();
  }
};