// src/components/ControlPanel/ControlPanel.jsx
import React, { useState } from 'react';
import './ControlPanel.css';
import { FaMapMarkerAlt, FaRoute, FaSlidersH, FaRocket, FaTrashAlt, FaDownload, FaUpload, FaChevronLeft, FaChevronRight, FaPrint, FaPlus, FaMinus } from 'react-icons/fa';

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
  isSidePanelOpen,
  toggleSidePanel,
  handlePointsGeoJSONUpload,
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
            <option value="">Добавить группу дорог</option>
            {roadGroups.filter(g => !loadedRoadGroups.includes(g)).map(group => (
              <option key={group} value={group}>
                {group.replace('.geojson', '')}
              </option>
            ))}
          </select>
          <div className="select-arrow">+</div>
        </div>

        {/* Отображение загруженных групп дорог с кнопкой удаления */}
        <div className="loaded-groups-list">
          {loadedRoadGroups.map(group => (
            <div key={group} className="loaded-group-item">
              <span className="group-name">{group.replace('.geojson', '')}</span>
              <button
                className="remove-group-btn"
                onClick={() => onRoadGroupRemove(group)}
                title={`Удалить группу дорог ${group}`}
              >
                <FaMinus />
              </button>
            </div>
          ))}
        </div>

        {/* Кнопка очистки всех дорог */}
        {loadedRoadGroups.length > 0 && (
          <button
            className="modern-btn danger"
            onClick={onRoadsClear}
            title="Очистить все загруженные дороги"
          >
            <span className="btn-icon"><FaTrashAlt /></span>
            <span className="btn-text">Очистить дороги</span>
          </button>
        )}

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
            <option value="">Добавить группу точек</option>
            {groups.filter(g => !loadedGroups.includes(g)).map(group => (
              <option key={group} value={group}>
                {group.replace('.json', '')}
              </option>
            ))}
          </select>
          <div className="select-arrow">+</div>
        </div>

        {/* Отображение загруженных групп точек с кнопкой удаления */}
        <div className="loaded-groups-list">
          {loadedGroups.map(group => (
            <div key={group} className="loaded-group-item">
              <span className="group-name">{group.replace('.json', '')}</span>
              <button
                className="remove-group-btn"
                onClick={() => onGroupRemove(group)}
                title={`Удалить группу точек ${group}`}
              >
                <FaMinus />
              </button>
            </div>
          ))}
        </div>

        {/* Выпадающий список с кнопками действий (открывается по наведению) */}
        <div
          className="control-group modern-dropdown-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`modern-btn secondary dropdown-toggle ${isDropdownOpen ? 'open' : ''}`}
            // Убираем onClick, так как теперь открытие по наведению
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
          {/* Кнопка "Панель" теперь просто переключает боковую панель */}
          <ModernToggle
            icon={<FaSlidersH />}
            label="Панель"
            checked={showButtons}
            onChange={toggleSidePanel}
            tooltip={showButtons ? "Скрыть боковую панель" : "Показать боковую панель"}
          />
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