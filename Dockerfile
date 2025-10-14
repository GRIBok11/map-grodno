FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Экспортируем порт (Vite использует 5173 по умолчанию)
EXPOSE 5173

# Команда запуска для разработки с Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]