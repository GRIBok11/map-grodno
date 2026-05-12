// server/simple-websocket.js
import { WebSocketServer } from 'ws';
import fs from 'fs';

const geojson = JSON.parse(fs.readFileSync('public/data/roads/понедельник.geojson', 'utf8'));
const route = geojson.features[0].geometry.coordinates;

const wss = new WebSocketServer({ port: 8081 });
console.log('🚗 WebSocket сервер запущен на порту 8081');

wss.on('connection', (ws) => {
  console.log('✅ Новое подключение');

  let segmentIndex = 0;
  let progress = 0;

  const speed = 0.05;   // шаг прогресса (0.05 = 5% сегмента за тик)
  const interval = setInterval(() => {
    const [lng1, lat1] = route[segmentIndex];
    const [lng2, lat2] = route[segmentIndex + 1] || route[segmentIndex];

    // линейная интерполяция
    const lat = lat1 + (lat2 - lat1) * progress;
    const lng = lng1 + (lng2 - lng1) * progress;

    ws.send(JSON.stringify({
      type: 'car_update',
      car: {
        id: 'car1',
        lat,
        lng,
        name: 'Машинка 1'
      }
    }));

    console.log(`📍 Машинка: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

    progress += speed;
    if (progress >= 1) {
      progress = 0;
      segmentIndex++;
      if (segmentIndex >= route.length - 1) {
        clearInterval(interval);
        console.log('🏁 Машинка доехала до конца маршрута');
      }
    }
  }, 500); // обновляем каждые 0.5 секунды

  ws.on('close', () => {
    console.log('❌ Соединение закрыто');
    clearInterval(interval);
  });
});
