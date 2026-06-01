// src/components/LoginPage/LoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css';

// 🔹 ЗАГЛУШКА "БЭКЕНДА"
// В реальном проекте эти данные придут из API. Сейчас они имитируют базу пользователей.
const MOCK_USERS = [
  { 
    username: 'admin', 
    password: 'super_admin', 
    role: 'super_user', 
    regions: ['all'] // Суперпользователь видит всё
  },
  { 
    username: 'msk_manager', 
    password: 'msk2024', 
    role: 'regional_manager', 
    regions: ['Москва', 'Московская область'] 
  },
  { 
    username: 'spb_manager', 
    password: 'spb2024', 
    role: 'regional_manager', 
    regions: ['Санкт-Петербург', 'Ленинградская область'] 
  },
  { 
    username: 'kzn_manager', 
    password: 'kzn2024', 
    role: 'regional_manager', 
    regions: ['Казань', 'Республика Татарстан'] 
  }
];

// 🔹 Имитация сетевого запроса
const mockLoginApi = (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        (u) => u.username === credentials.username && u.password === credentials.password
      );
      if (user) {
        // Возвращаем только безопасные данные (без пароля)
        resolve({
          username: user.username,
          role: user.role,
          regions: user.regions
        });
      } else {
        reject(new Error('Неверное имя пользователя или пароль'));
      }
    }, 1000); // Имитация задержки сети 1 сек
  });
};

const LoginPage = ({ onLogin, onGoToMainApp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await mockLoginApi({ username, password });
      // Передаём данные пользователя наверх. Родительский компонент должен использовать userData.regions для фильтрации
      onLogin(userData); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Вход в систему</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Имя пользователя:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Подключение к серверу...' : 'Войти'}
          </button>
        </form>
        
        <button 
          onClick={onGoToMainApp} 
          className="back-btn" 
          disabled={isLoading}
        >
          Назад
        </button>
      </div>
    </div>
  );
};

export default LoginPage;