import React, { useState } from 'react';
import './ControlPanel.css';
import { 
  FaMapMarkerAlt, FaRoute, FaSlidersH, FaRocket, FaTrashAlt, 
  FaDownload, FaUpload, FaChevronLeft, FaChevronRight, FaPrint, FaUser, FaCar, FaTachometerAlt
} from 'react-icons/fa';

// 🔹 Стили модального окна
const MODAL_STYLES = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(3px)' },
  content: { background: '#fff', padding: '24px', borderRadius: '12px', width: '340px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', textAlign: 'center', position: 'relative' },
  btnGroup: { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }
};

const ControlPanel = ({
  groups = [], loadedGroups = [], onGroupAdd,
  roadGroups = [], loadedRoadGroups = [], onRoadGroupAdd,
  clearRoutes, downloadGeoJSON, handleGeoJSONUpload, handlePointsGeoJSONUpload,
  onLogout, onOpenLogin, isAuthenticated, toggleSidePanel,
  districtsList = [], selectedDistrict, onDistrictSelect,
  isWebSocketConnected = false, carsCount = 0,
  showPoints, setShowPoints, showRoutes, setShowRoutes,
  showButtons, buildRoute,
  carsFilter = 'all',
  setCarsFilter,
  // 🔹 НОВЫЙ ПРОПС ДЛЯ ДИНАМИЧЕСКИХ ОБЪЕКТОВ
  showDynamicObjects = true,
  setShowDynamicObjects
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('A4');

  const openPrintModal = () => setShowPrintModal(true);
  const closePrintModal = () => setShowPrintModal(false);

  const handlePrintDownload = () => {
    const fileName = `Lida_${selectedFormat}.doc`;
    const districtInfo = selectedDistrict ? `Район: ${selectedDistrict}` : 'Район: Все районы';
    const routesInfo = `Активных маршрутов: ${loadedRoadGroups.length || 0}`;
    const content = `ОТЧЁТ ПО МАРШРУТАМ\n====================\nФормат печати: ${selectedFormat}\n${districtInfo}\n${routesInfo}\n\n[Карта и таблица маршрутов]`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    closePrintModal();
  };

  return (
    <>
      <div className="modern-top-controls">
        <div className="controls-left">
          <div className="app-brand">
            <div className="app-logo">🗺️</div>
            <span className="app-name">Карта</span>
          </div>

          {/* 🔹 Селектор фильтрации машин */}
          <div className="control-group modern-select-wrapper">
            <select value={carsFilter} onChange={(e) => setCarsFilter(e.target.value)} className="modern-select">
              <option value="all">🚗 Все машины</option>
              <option value="hidden">🚗 Скрыть машины</option>
              <option value="district">🚗 По району</option>
            </select>
            <div className="select-arrow">▼</div>
          </div>

          {/* 🔹 Кнопка управления динамическими объектами */}
          <button 
            className={`modern-btn ${showDynamicObjects ? 'primary' : 'secondary'}`}
            onClick={() => setShowDynamicObjects(!showDynamicObjects)}
            title={showDynamicObjects ? "Скрыть динамические объекты" : "Показать динамические объекты"}
          >
            <span className="btn-icon"><FaTachometerAlt /></span>
            <span className="btn-text">{showDynamicObjects ? "Скрыть объекты" : "Показать объекты"}</span>
          </button>

          <div className="control-group modern-select-wrapper">
            <select value={selectedDistrict || ''} onChange={(e) => onDistrictSelect(e.target.value || null)} className="modern-select">
              <option value="">📍 Районы</option>
              {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="select-arrow">▼</div>
          </div>

          <div className="control-group modern-select-wrapper">
            <select onChange={(e) => { if (e.target.value) { onRoadGroupAdd(e.target.value); e.target.value = ''; } }} className="modern-select" disabled={loadedRoadGroups.length >= roadGroups.length}>
              <option value="">🛣️ Маршруты</option>
              {roadGroups.filter(g => !loadedRoadGroups.includes(g)).map(group => (<option key={group} value={group}>{group.replace('.geojson', '')}</option>))}
            </select>
            <div className="select-arrow">+</div>
          </div>

          <div className="control-group modern-select-wrapper">
            <select onChange={(e) => { if (e.target.value) { onGroupAdd(e.target.value); e.target.value = ''; } }} className="modern-select" disabled={loadedGroups.length >= groups.length}>
              <option value="">📍 Точки</option>
              {groups.filter(g => !loadedGroups.includes(g)).map(group => (<option key={group} value={group}>{group.replace('.json', '')}</option>))}
            </select>
            <div className="select-arrow">+</div>
          </div>

          <div className="control-group modern-dropdown-wrapper" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
            <button className={`modern-btn secondary dropdown-toggle ${isDropdownOpen ? 'open' : ''}`}>
              <span className="btn-icon"><FaSlidersH /></span>
              <span className="btn-text">Доп. действия</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-panel-content">
                <label className="modern-btn secondary file-upload"><span className="btn-icon"><FaUpload /></span><span className="btn-text">Импорт точек</span><input type="file" accept=".geojson,.json" onChange={handlePointsGeoJSONUpload} className="file-input" /></label>
                <label className="modern-btn secondary file-upload"><span className="btn-icon"><FaUpload /></span><span className="btn-text">Импорт маршрутов</span><input type="file" accept=".geojson,.json" onChange={handleGeoJSONUpload} className="file-input" /></label>
                <button className="modern-btn secondary" onClick={downloadGeoJSON}><span className="btn-icon"><FaDownload /></span><span className="btn-text">Экспорт маршрутов</span></button>
                <button className="modern-btn danger" onClick={clearRoutes}><span className="btn-icon"><FaTrashAlt /></span><span className="btn-text">Очистить маршруты</span></button>
                <button className="modern-btn secondary" onClick={openPrintModal}><span className="btn-icon"><FaPrint /></span><span className="btn-text">Печать / Экспорт</span></button>
              </div>
            )}
          </div>
        </div>

        <div className="controls-center">
          <div className="visibility-controls modern-toggle-group">
            <ModernToggle icon={<FaMapMarkerAlt />} label="Точки" checked={showPoints} onChange={setShowPoints} />
            <ModernToggle icon={<FaRoute />} label="Маршруты" checked={showRoutes} onChange={setShowRoutes} />
            <div className="websocket-status" style={{ display: 'flex', alignItems: 'center', margin: '0 10px', color: isWebSocketConnected ? '#22c55e' : '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>
              {isWebSocketConnected ? '🟢 WS' : '🔴 Offline'}
            </div>
          </div>
        </div>

        <div className="controls-right">
          <div className="action-buttons">
            <ModernButton icon={<FaRocket />} label="Построить" onClick={buildRoute} variant="primary" />
            <ModernButton icon={<FaTrashAlt />} label="Очистить" onClick={clearRoutes} variant="danger" />
            <ModernButton icon={<FaPrint />} label="Печать" onClick={openPrintModal} variant="secondary" />
            {isAuthenticated ? (
              <ModernButton icon={<FaUser />} label="Выйти" onClick={onLogout} variant="secondary" />
            ) : (
              <ModernButton icon={<FaUser />} label="Войти" onClick={onOpenLogin} variant="secondary" />
            )}
          </div>
          <button className={`panel-toggle ${showButtons ? 'open' : ''}`} onClick={toggleSidePanel}>
            <span className="toggle-icon">{showButtons ? <FaChevronLeft /> : <FaChevronRight />}</span>
          </button>
        </div>
      </div>

      {showPrintModal && (
        <div style={MODAL_STYLES.overlay} onClick={closePrintModal}>
          <div style={MODAL_STYLES.content} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Выберите формат печати</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              {['A4', 'A0'].map(fmt => (
                <button key={fmt} style={{ padding: '10px 24px', borderRadius: '8px', border: `2px solid ${selectedFormat === fmt ? '#4CAF50' : '#e5e7eb'}`, background: selectedFormat === fmt ? '#4CAF50' : '#f9fafb', color: selectedFormat === fmt ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }} onClick={() => setSelectedFormat(fmt)}>{fmt}</button>
              ))}
            </div>
            <div style={MODAL_STYLES.btnGroup}>
              <button onClick={handlePrintDownload} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Скачать .doc</button>
              <button onClick={closePrintModal} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ModernToggle = ({ icon, label, checked, onChange }) => (
  <div className="modern-toggle">
    <input type="checkbox" id={`toggle-${label}`} checked={checked} onChange={(e) => onChange(e.target.checked)} className="toggle-input" />
    <label htmlFor={`toggle-${label}`} className="toggle-label">
      <span className="toggle-icon">{icon}</span><span className="toggle-text">{label}</span>
    </label>
  </div>
);

const ModernButton = ({ icon, label, onClick, variant = 'secondary' }) => (
  <button className={`modern-btn ${variant}`} onClick={onClick}>
    <span className="btn-icon">{icon}</span><span className="btn-text">{label}</span>
  </button>
);

export default ControlPanel;