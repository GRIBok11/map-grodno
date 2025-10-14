import React from 'react'
import './ModernUI.css'
import { FaMapMarkerAlt, FaRoute, FaSlidersH, FaRocket, FaTrashAlt, FaDownload, FaUpload, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { FaPrint } from 'react-icons/fa'

const ControlPanel = ({
  groups,
  currentGroup,
  onGroupChange,
  roadGroups,
  currentRoadGroup,
  onRoadGroupChange,
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
  handlePointsGeoJSONUpload
}) => {
  return (
    <div className="modern-top-controls">
      <div className="controls-left">
        <div className="app-brand">
          <div className="app-logo">🗺️</div>
          <span className="app-name"></span>
        </div>

        {/* Селектор для выбора дорог */}
        <div className="control-group modern-select-wrapper">
          <select 
            value={currentRoadGroup}
            onChange={(e) => onRoadGroupChange(e.target.value)}
            className="modern-select"
          >
            <option value="">Выберите дороги</option>
            {roadGroups.map(group => (
              <option key={group} value={group}>
                {group.replace('.geojson', '')}
              </option>
            ))}
          </select>
          <div className="select-arrow">▼</div>
        </div>

        {/* Селектор для выбора точек */}
        <div className="control-group modern-select-wrapper">
          <select 
            value={currentGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            className="modern-select"
          >
            <option value="">Выберите группу</option>
            {groups.map(group => (
              <option key={group} value={group}>
                {group.replace('.json', '')}
              </option>
            ))}
          </select>
          <div className="select-arrow">▼</div>
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
            label="Дороги"
            checked={showRoads}
            onChange={setShowRoads}
            tooltip="Показать/скрыть дороги"
          />
          <FileUploadButton
            icon={<FaUpload />}
            label="Импорт точек"
            onFileUpload={handlePointsGeoJSONUpload}
            tooltip="Загрузить точки из GeoJSON файла"
          />
          <ModernToggle
            icon={<FaRoute />}
            label="Маршруты"
            checked={showRoutes}
            onChange={setShowRoutes}
            tooltip="Показать/скрыть маршруты"
          />
          <ModernToggle
            icon={<FaSlidersH />}
            label="Панель"
            checked={showButtons}
            onChange={setShowButtons}
            tooltip="Показать/скрыть панель управления"
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
            tooltip="Очистить все маршруты"
          />
          <ModernButton
            icon={<FaDownload />}
            label="Экспорт"
            onClick={downloadGeoJSON}
            variant="secondary"
            tooltip="Скачать маршруты в формате GeoJSON"
          />
          <FileUploadButton
            icon={<FaUpload />}
            label="Импорт"
            onFileUpload={handleGeoJSONUpload}
            tooltip="Загрузить маршруты из GeoJSON файла"
          />
          <ModernButton
            icon={<FaPrint />}
            label="Печать"
            tooltip="Распечатать текущую карту и маршруты"
          />
        </div>

        {/* Кнопка переключения боковой панели — всегда видна */}
        <button 
          className={`panel-toggle ${isSidePanelOpen ? 'open' : ''}`}
          onClick={toggleSidePanel}
          title={isSidePanelOpen ? "Скрыть панель" : "Показать панель"}
        >
          <span className="toggle-icon">
            {isSidePanelOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </span>
        </button>
      </div>
    </div>
  )
}

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
)

const ModernButton = ({ icon, label, onClick, variant = 'secondary', tooltip }) => (
  <button 
    className={`modern-btn ${variant}`}
    onClick={onClick}
    title={tooltip}
  >
    <span className="btn-icon">{icon}</span>
    <span className="btn-text">{label}</span>
  </button>
)

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
)

export default ControlPanel