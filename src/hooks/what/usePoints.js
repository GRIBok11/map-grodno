import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const usePoints = () => {
  const [points, setPoints] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [currentGroup, setCurrentGroup] = useState('');
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadGroupPoints = useCallback(async (file, map) => {
    if (!file || !map) return;
    
    try {
      setLoading(true);
      const pointsData = await apiService.loadGroupPoints(file);
      
      // Очищаем предыдущие маркеры
      clearMarkers(map);
      
      setPoints(pointsData);
      
      // Создаем новые маркеры
      const newMarkers = pointsData.map((point) => {
        const marker = L.marker([point.lat, point.lon]).addTo(map);
        marker.bindPopup(`<b>${point.name}</b><br>${point.address}`);
        return marker;
      });
      
      setMarkers(newMarkers);
      setCurrentGroup(file);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMarkers = useCallback((map) => {
    markers.forEach(marker => {
      if (map) {
        map.removeLayer(marker);
      }
    });
    setMarkers([]);
  }, [markers]);

  const selectPoint = useCallback((pointId) => {
    setSelectedPoints(prev => {
      if (prev.includes(pointId)) {
        return prev.filter(id => id !== pointId);
      } else {
        if (prev.length < 2) {
          return [...prev, pointId];
        } else {
          alert('Можно выбрать только две точки для построения маршрута');
          return prev;
        }
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPoints([]);
  }, []);

  return {
    points,
    selectedPoints,
    currentGroup,
    markers,
    loading,
    loadGroupPoints,
    selectPoint,
    clearSelection,
    clearMarkers
  };
};