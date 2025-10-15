// src/components/SidePanel/SidePanel.jsx
import React from 'react';
import './SidePanel.css';
import { FaTimes, FaUpload, FaDownload, FaTrashAlt, FaRocket, FaPrint } from 'react-icons/fa';

const SidePanel = ({
  isOpen,
  onClose,
  children,
  searchQuery, // Получаем состояние поиска
  setSearchQuery, // Получаем функцию обновления поиска
  showButtons, // Получаем состояние showButtons
  setShowButtons, // Получаем функцию обновления showButtons
  handlePointsGeoJSONUpload,
  handleGeoJSONUpload,
  downloadGeoJSON,
  groups,
  loadedGroups,
  onGroupAdd,
  onGroupRemove,
  roadGroups,
  loadedRoadGroups,
  onRoadGroupAdd,
  onRoadGroupRemove,
  onRoadsClear,
  clearRoutes
}) => {
  return (
    <div className={`side-panel ${isOpen ? '' : 'closed'}`}>
      <div className="panel-header">
        <div className="panel-title">Панель управления</div>
        <button className="panel-close" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <div className="panel-content">
        {/* Поле поиска в боковой панели */}
        <div className="panel-section">
          <div className="section-title">Поиск точек</div>
          <input
            type="text"
            placeholder="Введите название или адрес..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Кнопки управления (появляются при нажатии на панель или при её открытии) */}
        {showButtons && (
          <div className="panel-section">
            <div className="section-title">Действия</div>
            <div className="action-buttons-grid">
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
                className="modern-btn primary"
                onClick={() => setShowButtons(false)} // Скрывает кнопки при нажатии
                title="Скрыть панель управления"
              >
                <span className="btn-icon"><FaRocket /></span>
                <span className="btn-text">Скрыть панель</span>
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
          </div>
        )}

        {/* Кнопка для отображения кнопок управления */}
        {!showButtons && (
          <div className="panel-section">
            <button
              className="modern-btn secondary"
              onClick={() => setShowButtons(true)} // Показывает кнопки при нажатии
              title="Показать панель управления"
            >
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">Показать управление</span>
            </button>
          </div>
        )}

        {/* Остальные компоненты (точки, маршруты) */}
        {children}
      </div>
    </div>
  );
};

// Компонент для кнопки загрузки файлов
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

export default SidePanel;