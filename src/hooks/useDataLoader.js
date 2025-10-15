// src/hooks/useDataLoader.js
import { useState, useEffect } from 'react';
import { loadDistricts, fetchGroupList } from '../services/dataService.js'; // <--- Исправленный путь

export const useDataLoader = () => {
  const [districts, setDistricts] = useState(null);
  const [groups, setGroups] = useState([]);
  const [roadGroups, setRoadGroups] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [districtsData, pointsData, roadsData] = await Promise.allSettled([
          loadDistricts(),
          fetchGroupList('points'),
          fetchGroupList('roads')
        ]);

        if (districtsData.status === 'fulfilled') {
          setDistricts(districtsData.value);
        } else {
          console.error('Ошибка загрузки районов:', districtsData.reason);
        }

        if (pointsData.status === 'fulfilled') {
          setGroups(pointsData.value);
        } else {
          console.error('Ошибка загрузки точек:', pointsData.reason);
        }

        if (roadsData.status === 'fulfilled') {
          setRoadGroups(roadsData.value);
        } else {
          console.error('Ошибка загрузки дорог:', roadsData.reason);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };

    loadData();
  }, []);

  return { districts, groups, roadGroups };
};