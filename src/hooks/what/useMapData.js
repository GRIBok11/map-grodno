import { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';

export const useMapData = () => {
  const [districts, setDistricts] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await apiService.loadDistricts();
      setDistricts(data);
    } catch (err) {
      setError('Ошибка загрузки границ районов');
      console.error('Error loading districts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await apiService.loadGroups();
      setGroups(data);
    } catch (err) {
      setError('Ошибка загрузки списка групп');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
    loadGroups();
  }, []);

  return {
    districts,
    groups,
    loading,
    error,
    refetchDistricts: loadDistricts,
    refetchGroups: loadGroups
  };
};