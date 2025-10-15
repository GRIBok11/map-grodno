// src/services/dataService.js
export const loadDistricts = async () => {
  try {
    const response = await fetch("/data/grodno.json");
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки границ районов:", error);
    throw error;
  }
};

export const fetchGroupList = async (type = 'points') => { // <--- Убедитесь, что функция экспортирована
  try {
    const response = await fetch(`/data/${type}/index.json`);
    return await response.json();
  } catch (error) {
    console.error(`Ошибка загрузки списка групп ${type}:`, error);
    throw error;
  }
};

export const loadGroupPoints = async (fileName) => {
  try {
    const response = await fetch(`/data/points/${fileName}`);
    const pointsData = await response.json();
    return pointsData.map((point, index) => ({
      ...point,
      id: index,
      name: point.description?.["Наименование"] || point.address || "Без названия",
      address: point.address || "Без адреса"
    }));
  } catch (error) {
    console.error("Ошибка загрузки точек:", error);
    throw error;
  }
};

export const loadRoadGroup = async (fileName) => {
  try {
    const response = await fetch(`/data/roads/${fileName}`);
    const roads = await response.json();
    return roads;
  } catch (error) {
    console.error("Ошибка загрузки дорог:", error);
    throw error;
  }
};