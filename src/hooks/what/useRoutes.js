import { useState, useCallback } from 'react';
import { apiService } from '../services/api.js';
import { geoJSONService } from '../services/geoJSON.js';
import { ROUTE_COLORS, GROUP_COLORS } from '../utils/constants';
import { calculateIntermediatePoints } from '../utils/helpers';

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [colorIndex, setColorIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadRoutes = useCallback(async (fileName, color) => {
    try {
      setLoading(true);
      const roads = await apiService.loadRoutes(fileName);
      
      const newRoutes = roads.features
        .filter(feature => feature.geometry.type === "LineString")
        .map((feature, index) => {
          const coords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
          
          return {
            id: `${fileName}-${index}`,
            name: feature.properties?.name || `Дорога ${index + 1}`,
            coordinates: coords,
            color: color,
            type: 'geojson'
          };
        });
      
      setRoutes(prev => [...prev, ...newRoutes]);
    } catch (error) {
      console.error(`Error loading routes for ${fileName}:`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildRoute = useCallback((point1, point2, currentGroup) => {
    if (!point1 || !point2) return null;

    const color = GROUP_COLORS[currentGroup] || ROUTE_COLORS[colorIndex % ROUTE_COLORS.length];
    const newColorIndex = colorIndex + 1;
    setColorIndex(newColorIndex);

    const coordinates = calculateIntermediatePoints(point1, point2);

    const newRoute = {
      id: Date.now(),
      name: `${point1.name} → ${point2.name}`,
      coordinates,
      color,
      type: 'calculated'
    };

    setRoutes(prev => [...prev, newRoute]);
    return newRoute;
  }, [colorIndex]);

  const clearRoutes = useCallback(() => {
    setRoutes([]);
    setColorIndex(0);
  }, []);

  const downloadGeoJSON = useCallback(() => {
    try {
      geoJSONService.downloadGeoJSON(routes);
    } catch (error) {
      alert(error.message);
    }
  }, [routes]);

  const uploadGeoJSON = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const newRoutesData = geoJSONService.parseUploadedGeoJSON(e.target.result);
          const color = ROUTE_COLORS[colorIndex % ROUTE_COLORS.length];
          const newColorIndex = colorIndex + newRoutesData.length;
          setColorIndex(newColorIndex);

          const newRoutes = newRoutesData.map((routeData, index) => ({
            id: `imported-${Date.now()}-${index}`,
            ...routeData,
            color,
            type: 'imported'
          }));

          setRoutes(prev => [...prev, ...newRoutes]);
          resolve(newRoutes);
        } catch (err) {
          reject(err);
        }
      };

      reader.readAsText(file);
    });
  }, [colorIndex]);

  return {
    routes,
    loading,
    loadRoutes,
    buildRoute,
    clearRoutes,
    downloadGeoJSON,
    uploadGeoJSON
  };
};