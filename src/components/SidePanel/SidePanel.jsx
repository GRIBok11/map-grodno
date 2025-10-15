// src/components/SidePanel/SidePanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import './SidePanel.css';
import { FaTimes, FaMapMarkerAlt, FaRoute, FaRoad, FaMinus, FaChevronRight, FaChevronDown } from 'react-icons/fa';

const SidePanel = ({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  children,
  loadedGroups = [],
  onGroupRemove,
  loadedRoadGroups = [],
  onRoadGroupRemove,
  onRoadsClear,
  points = [],
  routes = [],
  selectedPoints = [],
  onPointSelect
}) => {
  const [expandedSections, setExpandedSections] = useState({
    points: true,
    routes: true
  });
  
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Группировка точек по группам
  const groupedPoints = loadedGroups.reduce((acc, group) => {
    const groupPoints = points.filter(point => point.group === group);
    if (groupPoints.length > 0) {
      acc[group] = groupPoints;
    }
    return acc;
  }, {});

  // Группировка маршрутов по группам
  const groupedRoutes = loadedRoadGroups.reduce((acc, group) => {
    const groupRoutes = routes.filter(route => route.group === group);
    if (groupRoutes.length > 0) {
      acc[group] = groupRoutes;
    }
    return acc;
  }, {});

  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`}>
      <div className="side-panel-header">
        <h2>Панель управления</h2>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="side-panel-content">
        {/* Поиск */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Поиск точек и маршрутов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Загруженные группы дорог */}
        {loadedRoadGroups.length > 0 && (
          <div className="loaded-groups-section">
            <div 
              className={`section-header ${expandedSections.routes ? 'expanded' : ''}`}
              onClick={() => toggleSection('routes')}
            >
              <FaRoute className="section-icon" />
              <h3>Загруженные маршруты</h3>
              {loadedRoadGroups.length > 1 && (
                <button
                  className="clear-all-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoadsClear();
                  }}
                  title="Очистить все маршруты"
                >
                  Очистить все
                </button>
              )}
              <FaChevronDown className="expand-icon" />
            </div>
            
            {expandedSections.routes && (
              <div className="loaded-groups-list">
                {loadedRoadGroups.map(group => (
                  <GroupItem
                    key={group}
                    type="route"
                    group={group}
                    items={groupedRoutes[group] || []}
                    isExpanded={expandedGroups[group]}
                    onToggle={() => toggleGroup(group)}
                    onRemove={() => onRoadGroupRemove(group)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Загруженные группы точек */}
        {loadedGroups.length > 0 && (
          <div className="loaded-groups-section">
            <div 
              className={`section-header ${expandedSections.points ? 'expanded' : ''}`}
              onClick={() => toggleSection('points')}
            >
              <FaMapMarkerAlt className="section-icon" />
              <h3>Загруженные точки</h3>
              <FaChevronDown className="expand-icon" />
            </div>
            
            {expandedSections.points && (
              <div className="loaded-groups-list">
                {loadedGroups.map(group => (
                  <GroupItem
                    key={group}
                    type="point"
                    group={group}
                    items={groupedPoints[group] || []}
                    isExpanded={expandedGroups[group]}
                    onToggle={() => toggleGroup(group)}
                    onRemove={() => onGroupRemove(group)}
                    selectedPoints={selectedPoints}
                    onPointSelect={onPointSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Дочерние компоненты */}
        {children}
      </div>
    </div>
  );
};

// Компонент для отображения группы
const GroupItem = ({ 
  type, 
  group, 
  items, 
  isExpanded, 
  onToggle, 
  onRemove, 
  selectedPoints = [], 
  onPointSelect 
}) => {
  const contentRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const groupName = group.replace(/\.(json|geojson)$/, '');
  const isLargeGroup = items.length > 5; // Считаем группу большой если больше 5 элементов

  // Проверяем, нужна ли прокрутка
  useEffect(() => {
    if (contentRef.current && isExpanded) {
      const hasScrollbar = contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setIsScrollable(hasScrollbar);
    } else {
      setIsScrollable(false);
    }
  }, [isExpanded, items.length]);

  return (
    <div className={`group-item ${isLargeGroup ? 'large-group' : ''}`}>
      <div 
        className={`group-header ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
      >
        {type === 'point' ? (
          <FaMapMarkerAlt className="group-icon" />
        ) : (
          <FaRoute className="group-icon" />
        )}
        <span className="group-name">{groupName}</span>
        <span className={`group-count ${items.length > 10 ? 'large' : ''}`}>
          {items.length}
        </span>
        <FaChevronRight className="group-expand-icon" />
        <button
          className="remove-group-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title={`Удалить группу ${groupName}`}
        >
          <FaMinus />
        </button>
      </div>
      
      <div className={`group-items-list ${isExpanded ? 'expanded' : ''}`}>
        {isExpanded && (
          <div 
            ref={contentRef}
            className={`group-item-content ${isScrollable ? 'scrollable' : ''}`}
          >
            {type === 'point' ? (
              <PointsList 
                points={items} 
                selectedPoints={selectedPoints}
                onPointSelect={onPointSelect}
              />
            ) : (
              <RoutesList routes={items} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент для списка точек
const PointsList = ({ points, selectedPoints, onPointSelect }) => {
  if (points.length === 0) {
    return (
      <div className="empty-list-message">
        Нет точек в этой группе
      </div>
    );
  }

  return (
    <div className="points-list">
      {points.map(point => (
        <div
          key={point.id}
          className={`point-item ${selectedPoints.includes(point.id) ? 'selected' : ''}`}
          onClick={() => onPointSelect(point.id)}
          title={`${point.name}\n${point.address}`}
        >
          <div className="point-marker" style={{ backgroundColor: point.color }} />
          <div className="point-info">
            <div className="point-name">{point.name}</div>
            <div className="point-address">{point.address}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Компонент для списка маршрутов
const RoutesList = ({ routes }) => {
  if (routes.length === 0) {
    return (
      <div className="empty-list-message">
        Нет маршрутов в этой группе
      </div>
    );
  }

  return (
    <div className="routes-list">
      {routes.map(route => (
        <div key={route.id} className="route-item" title={route.name}>
          <div className="route-color" style={{ backgroundColor: route.color }} />
          <div className="route-info">
            <div className="route-name">{route.name}</div>
            <div className="route-details">
              {route.coordinates?.length || 0} точек
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidePanel;