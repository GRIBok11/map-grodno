// src/components/LoginPage/LoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css'; // Создадим файл стилей

const LoginPage = ({ onLogin, onGoToMainApp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Простая проверка (замените на реальную логику аутентификации)
    if (username === 'admin' && password === 'password') {
      onLogin(username); // Вызываем функцию из App для установки состояния аутентификации
    } else {
      setError('Неверное имя пользователя или пароль');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Вход</h2>
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
            />
          </div>
          <button type="submit" className="login-btn">Войти</button>
        </form>
        <button onClick={onGoToMainApp} className="back-btn">Назад</button>
      </div>
    </div>
  );
};

export default LoginPage;