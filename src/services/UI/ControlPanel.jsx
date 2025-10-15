import React from 'react';
import '/src/styles/App.css';

const ControlPanel = ({
  groups,
  currentGroup,
  onGroupChange,
  showPoints,
  setShowPoints,
  showRoutes,
  setShowRoutes,
  showButtons,
  setShowButtons,
  searchQuery,
  setSearchQuery,
  buildRoute,
  clearRoutes,
  downloadGeoJSON,
  handleGeoJSONUpload,
  isSidePanelOpen,
  toggleSidePanel
}) => {
  return (
    <div id="top-controls">
      <div className="logo">
        <span>🗺️ Управление маршрутами</span>
      </div>
      
      <div className="control-group">
        <div className="control-group-title">Группа точек:</div>
        <select 
          value={currentGroup}
          onChange={(e) => onGroupChange(e.target.value)}
        >
          <option value="">Выберите группу точек</option>
          {groups.map(group => (
            <option key={group} value={group}>
              {group.replace('.json', '')}
            </option>
          ))}
        </select>
      </div>
      
      <div className="control-group">
        <div className="control-group-title">Отображение:</div>
        <div className="visibility-controls">
          <label 
            className={`icon-toggle ${showPoints ? 'active' : ''}`}
            title="Показать точки"
          >
            <input 
              type="checkbox" 
              checked={showPoints}
              onChange={(e) => setShowPoints(e.target.checked)}
            />
            <span className="toggle-icon">📍</span>
            <span className="toggle-label">Точки</span>
          </label>
          <label 
            className={`icon-toggle ${showRoutes ? 'active' : ''}`}
            title="Показать маршруты"
          >
            <input 
              type="checkbox" 
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
            />
            <span className="toggle-icon">🛣️</span>
            <span className="toggle-label">Маршруты</span>
          </label>
          <label 
            className={`icon-toggle ${showButtons ? 'active' : ''}`}
            title="Показать кнопки маршрутов"
          >
            <input 
              type="checkbox" 
              checked={showButtons}
              onChange={(e) => setShowButtons(e.target.checked)}
            />
            <span className="toggle-icon">⚙️</span>
            <span className="toggle-label">Управление</span>
          </label>
        </div>
      </div>
      
      {showButtons && (
        <div className="control-group">
          <div className="control-group-title">Действия:</div>
          <div className="icon-button-group">
            <button 
              className="icon-button" 
              onClick={buildRoute}
              title="Построить маршрут"
            >
              <span className="button-text">➡️</span>
            </button>
            <button 
              className="icon-button danger" 
              onClick={clearRoutes}
              title="Очистить маршруты"
            >
              <span className="button-text">🗑️</span>
            </button>
            <button 
              className="icon-button" 
              onClick={downloadGeoJSON}
              title="Скачать маршруты в GeoJSON"
            >
              <span className="button-text">📥</span>
            </button>
            <label className="icon-button" title="Загрузить GeoJSON">
              <span className="button-text">📤</span>
              <input 
                type="file" 
                accept=".geojson,.json" 
                onChange={handleGeoJSONUpload}
                style={{display: 'none'}}
              />
            </label>
          </div>
        </div>
      )}
      
      <div className="control-group">
        <div className="control-group-title">Поиск:</div>
        <input 
          type="text" 
          placeholder="Поиск по адресу или названию" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <button 
        className="toggle-side-panel-btn"
        onClick={toggleSidePanel}
        title={isSidePanelOpen ? "Скрыть панель" : "Показать панель"}
      >
        {isSidePanelOpen ? "◀" : "▶"}
      </button>
    </div>
  );
};

export default ControlPanel;