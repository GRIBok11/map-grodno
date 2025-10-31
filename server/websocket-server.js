// server/websocket-server.js
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer();
const wss = new WebSocketServer({ server });

// Хранилище подключенных клиентов
const clients = new Set();

// Хранилище данных автомобилей
const vehicles = new Map();

// Хранилище интервалов симуляции
const simulationIntervals = new Map();

wss.on('connection', (ws) => {
  console.log('Новое подключение WebSocket');
  clients.add(ws);

  // Отправляем текущее состояние всех автомобилей новому клиенту
  vehicles.forEach((vehicle, id) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'vehicle_update',
        vehicle: { id, ...vehicle }
      }));
    }
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Получено сообщение:', data);
      
      if (data.type === 'start_simulation') {
        const { vehicleId, route, speed = 50 } = data;
        startVehicleSimulation(vehicleId, route, speed);
      }
      
      if (data.type === 'stop_simulation') {
        const { vehicleId } = data;
        stopVehicleSimulation(vehicleId);
      }

      if (data.type === 'vehicle_position') {
        // Обновляем позицию автомобиля
        vehicles.set(data.vehicleId, {
          lat: data.lat,
          lng: data.lng,
          routeId: data.routeId,
          timestamp: Date.now()
        });

        // Рассылаем обновление всем клиентам
        broadcast({
          type: 'vehicle_update',
          vehicle: {
            id: data.vehicleId,
            lat: data.lat,
            lng: data.lng,
            routeId: data.routeId
          }
        });
      }
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket соединение закрыто');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket ошибка:', error);
    clients.delete(ws);
  });
});

function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(messageStr);
    }
  });
}

// Функция для имитации движения автомобиля по маршруту
function startVehicleSimulation(vehicleId, routeCoordinates, speed = 50) {
  // Останавливаем существующую симуляцию, если есть
  if (simulationIntervals.has(vehicleId)) {
    clearInterval(simulationIntervals.get(vehicleId));
  }

  let currentIndex = 0;
  
  const moveVehicle = () => {
    if (!routeCoordinates || routeCoordinates.length === 0) {
      console.error('Нет координат маршрута для автомобиля', vehicleId);
      return;
    }

    if (currentIndex >= routeCoordinates.length) {
      currentIndex = 0; // Начать заново
    }

    const [lat, lng] = routeCoordinates[currentIndex];
    
    // Обновляем позицию автомобиля
    vehicles.set(vehicleId, {
      lat,
      lng,
      routeId: `route_${vehicleId}`,
      timestamp: Date.now(),
      speed: speed
    });

    // Рассылаем обновление
    broadcast({
      type: 'vehicle_update',
      vehicle: {
        id: vehicleId,
        lat,
        lng,
        routeId: `route_${vehicleId}`,
        speed: speed
      }
    });

    console.log(`Автомобиль ${vehicleId} перемещен к точке ${currentIndex}: [${lat}, ${lng}]`);
    currentIndex++;
  };

  // Запускаем движение каждые 2 секунды
  const interval = setInterval(moveVehicle, 2000);
  simulationIntervals.set(vehicleId, interval);
  
  // Немедленно перемещаем к первой точке
  moveVehicle();
  
  console.log(`Запущена симуляция автомобиля ${vehicleId} по маршруту с ${routeCoordinates.length} точками`);
}

function stopVehicleSimulation(vehicleId) {
  if (simulationIntervals.has(vehicleId)) {
    clearInterval(simulationIntervals.get(vehicleId));
    simulationIntervals.delete(vehicleId);
  }
  
  if (vehicles.has(vehicleId)) {
    vehicles.delete(vehicleId);
  }
  
  // Уведомляем клиентов об удалении автомобиля
  broadcast({
    type: 'vehicle_removed',
    vehicleId: vehicleId
  });
  
  console.log(`Симуляция автомобиля ${vehicleId} остановлена`);
}

// Запуск сервера
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ WebSocket сервер запущен на порту ${PORT}`);
  console.log(`📍 Подключение: ws://localhost:${PORT}`);
});

// Обработка graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка WebSocket сервера...');
  
  // Останавливаем все симуляции
  simulationIntervals.forEach((interval, vehicleId) => {
    clearInterval(interval);
  });
  
  // Закрываем все соединения
  clients.forEach(client => {
    client.close();
  });
  
  server.close(() => {
    console.log('✅ WebSocket сервер остановлен');
    process.exit(0);
  });
});

export { wss, startVehicleSimulation, stopVehicleSimulation, broadcast };