// src/components/SidePanel/SidePanel.jsx
import React from 'react';
import './SidePanel.css';
import { FaTimes, FaUpload, FaDownload, FaTrashAlt, FaRocket, FaPrint } from 'react-icons/fa';

const SidePanel = ({
  isOpen,
  onClose,
  children,
  searchQuery, // Получаем состояние поиска
  setSearchQuery // Получаем функцию обновления поиска
  
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

        
        

        {/* Остальные компоненты (точки, маршруты) */}
        {children}
      </div>
    </div>
  );
};


export default SidePanel;