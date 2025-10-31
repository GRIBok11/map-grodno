// src/hooks/useWebSocket.js
import { useState, useEffect } from 'react';

export const useWebSocket = () => {
  const [cars, setCars] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('✅ Подключено к WebSocket');
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'car_update') {
        setCars(prev => {
          // Обновляем или добавляем машинку
          const otherCars = prev.filter(car => car.id !== data.car.id);
          return [...otherCars, data.car];
        });
      }
    };
    
    ws.onclose = () => {
      console.log('❌ Отключено от WebSocket');
      setIsConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('❌ Ошибка WebSocket:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { cars, isConnected };
};