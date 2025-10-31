// server/simple-websocket.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log('🚗 WebSocket сервер запущен на порту 8080');

wss.on('connection', (ws) => {
  console.log('✅ Новое подключение');
  
  // Отправляем тестовую машинку сразу после подключения
  ws.send(JSON.stringify({
    type: 'car_update',
    car: {
      id: 'car1',
      lat: 53.6884,
      lng: 23.8258,
      name: 'Машинка 1'
    }
  }));

  // Двигаем машинку каждые 2 секунды
  let lat = 53.6884;
  let lng = 23.8258;
  
  const interval = setInterval(() => {
    // Немного меняем координаты
    lat += 0.001;
    lng += 0.001;
    
    ws.send(JSON.stringify({
      type: 'car_update',
      car: {
        id: 'car1',
        lat: lat,
        lng: lng,
        name: 'Машинка 1'
      }
    }));
    
    console.log(`📍 Машинка перемещена: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }, 2000);

  ws.on('close', () => {
    console.log('❌ Соединение закрыто');
    clearInterval(interval);
  });
});