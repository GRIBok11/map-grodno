// src/components/ControlPanel/ControlPanel.jsx
import React, { useState } from 'react';
import './ControlPanel.css';
import { FaMapMarkerAlt, FaRoute, FaSlidersH, FaRocket, FaTrashAlt, FaDownload, FaUpload, FaChevronLeft, FaChevronRight, FaPrint, FaUser, FaMinus, FaMap, FaCrosshairs, FaCar } from 'react-icons/fa';

const ControlPanel = ({
  groups = [],
  loadedGroups = [],
  onGroupAdd,
  onGroupRemove,
  roadGroups = [],
  loadedRoadGroups = [],
  onRoadGroupAdd,
  onRoadGroupRemove,
  onRoadsClear,
  showPoints,
  setShowPoints,
  showRoutes,
  setShowRoutes,
  showRoads,
  setShowRoads,
  showButtons,
  setShowButtons,
  buildRoute,
  clearRoutes,
  downloadGeoJSON,
  handleGeoJSONUpload,
  onLogout, 
  onOpenLogin, 
  isAuthenticated,
  toggleSidePanel,
  handlePointsGeoJSONUpload,
  districtsList = [],
  selectedDistrict,
  onDistrictSelect,
  // Добавляем пропсы для WebSocket
  isWebSocketConnected = false,
  carsCount = 0
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Функции для обработки наведения и ухода курсора
  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="modern-top-controls">
      <div className="controls-left">
        <div className="app-brand">
          <div className="app-logo">🗺️</div>
          <span className="app-name">Карта</span>
        </div>

        {/* Селектор районов */}
        <div className="control-group modern-select-wrapper">
          <select
            value={selectedDistrict || ''}
            onChange={(e) => {
              if (e.target.value) {
                onDistrictSelect(e.target.value);
              } else {
                onDistrictSelect(null);
              }
            }}
            className="modern-select"
          >
            <option value="">Районы</option>
            {districtsList.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <div className="select-arrow">
            <FaMap />
          </div>
        </div>

        {/* Селектор для добавления дорог */}
        <div className="control-group modern-select-wrapper">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onRoadGroupAdd(e.target.value);
                e.target.value = ''; // Сбрасываем выбор
              }
            }}
            className="modern-select"
            disabled={loadedRoadGroups.length >= roadGroups.length}
          >
            <option value="">Маршруты</option>
            {roadGroups.filter(g => !loadedRoadGroups.includes(g)).map(group => (
              <option key={group} value={group}>
                {group.replace('.geojson', '')}
              </option>
            ))}
          </select>
          <div className="select-arrow">+</div>
        </div>

        {/* Селектор для добавления точек */}
        <div className="control-group modern-select-wrapper">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onGroupAdd(e.target.value);
                e.target.value = ''; // Сбрасываем выбор
              }
            }}
            className="modern-select"
            disabled={loadedGroups.length >= groups.length}
          >
            <option value="">Точки</option>
            {groups.filter(g => !loadedGroups.includes(g)).map(group => (
              <option key={group} value={group}>
                {group.replace('.json', '')}
              </option>
            ))}
          </select>
          <div className="select-arrow">+</div>
        </div>

        {/* Выпадающий список с кнопками действий */}
        <div
          className="control-group modern-dropdown-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`modern-btn secondary dropdown-toggle ${isDropdownOpen ? 'open' : ''}`}
            title="Показать дополнительные действия"
          >
            <span className="btn-icon"><FaSlidersH /></span>
            <span className="btn-text">Доп. действия</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-panel-content">
              <FileUploadButton
                icon={<FaUpload />}
                label="Импорт точек"
                onFileUpload={handlePointsGeoJSONUpload}
                tooltip="Загрузить точки из GeoJSON файла"
              />
              <FileUploadButton
                icon={<FaUpload />}
                label="Импорт маршрутов"
                onFileUpload={handleGeoJSONUpload}
                tooltip="Загрузить маршруты из GeoJSON файла"
              />
              <button
                className="modern-btn secondary"
                onClick={downloadGeoJSON}
                title="Скачать маршруты в формате GeoJSON"
              >
                <span className="btn-icon"><FaDownload /></span>
                <span className="btn-text">Экспорт маршрутов</span>
              </button>
              <button
                className="modern-btn danger"
                onClick={clearRoutes}
                title="Очистить все рассчитанные маршруты"
              >
                <span className="btn-icon"><FaTrashAlt /></span>
                <span className="btn-text">Очистить маршруты</span>
              </button>
              <button
                className="modern-btn secondary"
                onClick={() => window.print()}
                title="Распечатать текущую карту и маршруты"
              >
                <span className="btn-icon"><FaPrint /></span>
                <span className="btn-text">Печать</span>
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="controls-center">
        <div className="visibility-controls modern-toggle-group">
          <ModernToggle
            icon={<FaMapMarkerAlt />}
            label="Точки"
            checked={showPoints}
            onChange={setShowPoints}
            tooltip="Показать/скрыть точки"
          />
          <ModernToggle
            icon={<FaRoute />}
            label="Маршруты"
            checked={showRoutes}
            onChange={setShowRoutes}
            tooltip="Показать/скрыть маршруты"
          />
          {/* Добавляем статус WebSocket */}
          <div className="websocket-status" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '0 10px',
            color: isWebSocketConnected ? 'green' : 'red',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {isWebSocketConnected ? '✅' : '❌'} WebSocket
            {carsCount > 0 && <span style={{ marginLeft: '5px' }}>🚗 {carsCount}</span>}
          </div>
        </div>
      </div>

      <div className="controls-right">
        <div className="action-buttons">
          <ModernButton
            icon={<FaRocket />}
            label="Построить"
            onClick={buildRoute}
            variant="primary"
            tooltip="Построить маршрут между выбранными точками"
          />
          <ModernButton
            icon={<FaTrashAlt />}
            label="Очистить"
            onClick={clearRoutes}
            variant="danger"
            tooltip="Очистить все рассчитанные маршруты"
          />
          <ModernButton
            icon={<FaPrint />}
            label="Печать"
            onClick={() => window.print()}
            variant="secondary"
            tooltip="Распечатать текущую карту и маршруты"
          />
          {isAuthenticated ? (
            <ModernButton
              icon={<FaUser />}
              label="Выйти"
              onClick={onLogout}
              variant="secondary"
              tooltip="Выйти из системы"
            />
          ) : (
            <ModernButton
              icon={<FaUser />}
              label="Войти"
              onClick={onOpenLogin}
              variant="secondary"
              tooltip="Войти в систему"
            />
          )}
        </div>

        <button
          className={`panel-toggle ${showButtons ? 'open' : ''}`}
          onClick={toggleSidePanel}
          title={showButtons ? "Скрыть боковую панель" : "Показать боковую панель"}
        >
          <span className="toggle-icon">
            {showButtons ? <FaChevronLeft /> : <FaChevronRight />}
          </span>
        </button>
      </div>
    </div>
  );
};

const ModernToggle = ({ icon, label, checked, onChange, tooltip }) => (
  <div className="modern-toggle" title={tooltip}>
    <input
      type="checkbox"
      id={`toggle-${label}`}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="toggle-input"
    />
    <label htmlFor={`toggle-${label}`} className="toggle-label">
      <span className="toggle-icon">{icon}</span>
      <span className="toggle-text">{label}</span>
    </label>
  </div>
);

const ModernButton = ({ icon, label, onClick, variant = 'secondary', tooltip }) => (
  <button
    className={`modern-btn ${variant}`}
    onClick={onClick}
    title={tooltip}
  >
    <span className="btn-icon">{icon}</span>
    <span className="btn-text">{label}</span>
  </button>
);

const FileUploadButton = ({ icon, label, onFileUpload, tooltip }) => (
  <label className="modern-btn secondary file-upload" title={tooltip}>
    <span className="btn-icon">{icon}</span>
    <span className="btn-text">{label}</span>
    <input
      type="file"
      accept=".geojson,.json"
      onChange={onFileUpload}
      className="file-input"
    />
  </label>
);

export default ControlPanel;