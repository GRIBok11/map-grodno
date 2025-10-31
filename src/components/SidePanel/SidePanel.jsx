// src/components/SidePanel/SidePanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import './SidePanel.css';
import { FaTimes, FaMapMarkerAlt, FaRoute, FaRoad, FaMinus, FaChevronRight, FaChevronDown, FaCalendarAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

// Словарь дней недели
const WEEK_DAYS = {
  "понедельник": "Понедельник",
  "вторник": "Вторник",
  "среда": "Среда",
  "четверг": "Четверг",
  "пятница": "Пятница",
  "суббота": "Суббота",
  "воскресенье": "Воскресенье",
};

const SidePanel = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  children,
  loadedGroups = [], // Точки
  onGroupRemove,
  loadedRoadGroups = [], // Маршруты
  onRoadGroupRemove,
  onRoadsClear,
  points = [],
  routes = [],
  selectedPoints = [],
  onPointSelect,
  onToggleDayVisibility, // Функция для переключения видимости дня
  onToggleGroupVisibility, // Функция для переключения видимости группы
  hiddenDays = {}, // Объект с скрытыми днями { dayName: boolean }
  hiddenGroups = {} // Объект с скрытыми группами { groupName: boolean }
}) => {
  const [expandedSections, setExpandedSections] = useState({
    points: true,
    routes: true
  });
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('current'); // 'current' или 'archive'

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

  // Функция для переключения видимости дня
  const handleToggleDayVisibility = (day, e) => {
    e.stopPropagation();
    if (onToggleDayVisibility) {
      onToggleDayVisibility(day);
    }
  };

  // Функция для переключения видимости группы
  const handleToggleGroupVisibility = (group, e) => {
    e.stopPropagation();
    if (onToggleGroupVisibility) {
      onToggleGroupVisibility(group);
    }
  };

  // Функция для определения дня недели из названия файла
  const getDayFromFileName = (fileName) => {
    const lowerName = fileName.toLowerCase();
    for (const [dayKey, dayName] of Object.entries(WEEK_DAYS)) {
      if (lowerName.includes(dayKey)) {
        return dayName;
      }
    }
    // Если день не найден, возвращаем "Другое"
    return "Другое";
  };

  // Группировка загруженных файлов по дням
  const groupedLoadedPoints = loadedGroups.reduce((acc, group) => {
    const day = getDayFromFileName(group);
    if (!acc[day]) acc[day] = [];
    acc[day].push(group);
    return acc;
  }, {});

  const groupedLoadedRoads = loadedRoadGroups.reduce((acc, group) => {
    const day = getDayFromFileName(group);
    if (!acc[day]) acc[day] = [];
    acc[day].push(group);
    return acc;
  }, {});

  // --- Выбор данных для отображения в "Текущие" ---
  // Текущие = загруженные
  const currentPointsGroupedByDay = loadedGroups.reduce((acc, group) => {
    const day = getDayFromFileName(group);
    const groupPoints = points.filter(point => point.group === group);
    if (groupPoints.length > 0) {
      if (!acc[day]) acc[day] = [];
      acc[day].push(...groupPoints);
    }
    return acc;
  }, {});

  const currentRoutesGroupedByDay = loadedRoadGroups.reduce((acc, group) => {
    const day = getDayFromFileName(group);
    const groupRoutes = routes.filter(route => route.group === group && route.type === 'geojson');
    if (groupRoutes.length > 0) {
        if (!acc[day]) acc[day] = [];
        acc[day].push(...groupRoutes);
    }
    return acc;
  }, {});

  // --- Выбор данных для отображения в "Архив" ---
  const archivePoints = points.filter(p => !loadedGroups.includes(p.group));
  const archiveRoutes = routes.filter(r => r.type === 'geojson' && !loadedRoadGroups.includes(r.group));
  const archivePointsGroupedByDay = archivePoints.reduce((acc, point) => {
    const day = getDayFromFileName(point.group);
    if (!acc[day]) acc[day] = [];
    acc[day].push(point);
    return acc;
  }, {});

  const archiveRoutesGroupedByDay = archiveRoutes.reduce((acc, route) => {
    const day = getDayFromFileName(route.group);
    if (!acc[day]) acc[day] = [];
    acc[day].push(route);
    return acc;
  }, {});

  // --- Определение данных для отображения ---
  const displayPointsGroupedByDay = activeTab === 'current' ? currentPointsGroupedByDay : archivePointsGroupedByDay;
  const displayRoutesGroupedByDay = activeTab === 'current' ? currentRoutesGroupedByDay : archiveRoutesGroupedByDay;

  // --- Создание полного списка дней с пустыми данными ---
  const getAllDaysWithData = () => {
    // Все возможные дни (все дни недели + "Другое")
    const allPossibleDays = [...Object.values(WEEK_DAYS), "Другое"];
    
    // Собираем все дни, которые есть в данных
    const daysFromPoints = Object.keys(displayPointsGroupedByDay);
    const daysFromRoutes = Object.keys(displayRoutesGroupedByDay);
    const allDaysWithData = [...new Set([...daysFromPoints, ...daysFromRoutes])];
    
    // Добавляем все возможные дни, даже если данных нет
    const allDays = [...new Set([...allPossibleDays, ...allDaysWithData])];
    
    return allDays;
  };

  // --- Сортировка дней недели ---
  const sortDays = (days) => {
    const dayOrder = Object.values(WEEK_DAYS);
    return days.sort((a, b) => {
      const indexA = dayOrder.indexOf(a);
      const indexB = dayOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return 0; // Оба "Другое"
      if (indexA === -1) return 1; // "Другое" всегда в конце
      if (indexB === -1) return -1; // "Другое" всегда в конце
      return indexA - indexB;
    });
  };

  const allDays = getAllDaysWithData();
  const sortedDays = sortDays(allDays);

  // Функция для проверки, есть ли данные для дня
  const hasDataForDay = (day) => {
    const hasPoints = displayPointsGroupedByDay[day] && displayPointsGroupedByDay[day].length > 0;
    const hasRoutes = displayRoutesGroupedByDay[day] && displayRoutesGroupedByDay[day].length > 0;
    return hasPoints || hasRoutes;
  };

  // Функция для получения всех групп в дне
  const getAllGroupsInDay = (day) => {
    const pointGroups = displayPointsGroupedByDay[day] 
      ? [...new Set(displayPointsGroupedByDay[day].map(point => point.group))]
      : [];
    const routeGroups = displayRoutesGroupedByDay[day] 
      ? [...new Set(displayRoutesGroupedByDay[day].map(route => route.group))]
      : [];
    return [...new Set([...pointGroups, ...routeGroups])];
  };

  // Функция для проверки, скрыт ли весь день (все группы скрыты)
  const isDayFullyHidden = (day) => {
    const groups = getAllGroupsInDay(day);
    if (groups.length === 0) return false;
    return groups.every(group => hiddenGroups[group]);
  };

  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`} role="complementary" aria-label="Боковая панель управления">

      <div className="side-panel-content">
        {/* Поиск */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Поиск точек и маршрутов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Поиск точек и маршрутов"
          />
        </div>

        {/* Переключатель вкладок */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Текущие
          </button>
          <button
            className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            Архив
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="tab-content">
          {sortedDays.map(day => {
            const isDayHidden = hiddenDays[day];
            const isFullyHidden = isDayFullyHidden(day);
            
            return (
              <div key={day} className={`day-section ${isDayHidden || isFullyHidden ? 'hidden' : ''}`}>
                <div
                  className={`section-header ${expandedSections[day] ? 'expanded' : ''}`}
                  onClick={() => toggleSection(day)}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => e.key === 'Enter' && toggleSection(day)}
                >
                  <FaCalendarAlt className="section-icon" />
                  <h3>{day}</h3>
                  <div className="visibility-controls">
                    <button
                      className={`visibility-btn ${isDayHidden ? 'hidden' : ''}`}
                      onClick={(e) => handleToggleDayVisibility(day, e)}
                      title={isDayHidden ? "Показать день" : "Скрыть день"}
                      type="button"
                    >
                      {isDayHidden ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <FaChevronDown className="expand-icon" />
                  </div>
                </div>
                {expandedSections[day] && (
                  <div className="day-content">
                    {/* Точки для дня */}
                    <div className="loaded-groups-section">
                      <div
                        className={`section-header sub-header ${expandedSections[`${day}-points`] ? 'expanded' : ''}`}
                        onClick={() => toggleSection(`${day}-points`)}
                        role="button"
                        tabIndex="0"
                        onKeyDown={(e) => e.key === 'Enter' && toggleSection(`${day}-points`)}
                      >
                        <FaMapMarkerAlt className="section-icon" />
                        <h4>Точки</h4>
                        <FaChevronDown className="expand-icon" />
                      </div>
                      {expandedSections[`${day}-points`] && (
                        <div className="loaded-groups-list">
                          {displayPointsGroupedByDay[day] && displayPointsGroupedByDay[day].length > 0 ? (
                            (() => {
                              const groupedByFile = displayPointsGroupedByDay[day].reduce((acc, point) => {
                                if (!acc[point.group]) acc[point.group] = [];
                                acc[point.group].push(point);
                                return acc;
                              }, {});

                              return Object.entries(groupedByFile).map(([file, filePoints]) => (
                                <GroupItem
                                  key={`points-${file}`}
                                  type="point"
                                  group={file}
                                  items={filePoints}
                                  isExpanded={expandedGroups[file]}
                                  onToggle={() => toggleGroup(file)}
                                  onRemove={activeTab === 'current' ? onGroupRemove : undefined}
                                  selectedPoints={selectedPoints}
                                  onPointSelect={onPointSelect}
                                  isRemovable={activeTab === 'current'}
                                  isHidden={hiddenGroups[file]}
                                  onToggleVisibility={(e) => handleToggleGroupVisibility(file, e)}
                                />
                              ));
                            })()
                          ) : (
                            <div className="empty-day-message">
                              Нет точек для этого дня
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Маршруты для дня */}
                    <div className="loaded-groups-section">
                      <div
                        className={`section-header sub-header ${expandedSections[`${day}-routes`] ? 'expanded' : ''}`}
                        onClick={() => toggleSection(`${day}-routes`)}
                        role="button"
                        tabIndex="0"
                        onKeyDown={(e) => e.key === 'Enter' && toggleSection(`${day}-routes`)}
                      >
                        <FaRoute className="section-icon" />
                        <h4>Маршруты</h4>
                        {activeTab === 'current' && displayRoutesGroupedByDay[day] && displayRoutesGroupedByDay[day].length > 1 && (
                          <button
                            className="clear-all-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const filesInDay = new Set(displayRoutesGroupedByDay[day].map(r => r.group));
                              filesInDay.forEach(file => onRoadGroupRemove(file));
                            }}
                            title="Очистить все маршруты в день"
                            type="button"
                          >
                            Очистить все
                          </button>
                        )}
                        <FaChevronDown className="expand-icon" />
                      </div>
                      {expandedSections[`${day}-routes`] && (
                        <div className="loaded-groups-list">
                          {displayRoutesGroupedByDay[day] && displayRoutesGroupedByDay[day].length > 0 ? (
                            (() => {
                              const groupedByFile = displayRoutesGroupedByDay[day].reduce((acc, route) => {
                                if (!acc[route.group]) acc[route.group] = [];
                                acc[route.group].push(route);
                                return acc;
                              }, {});

                              return Object.entries(groupedByFile).map(([file, fileRoutes]) => (
                                <GroupItem
                                  key={`routes-${file}`}
                                  type="route"
                                  group={file}
                                  items={fileRoutes}
                                  isExpanded={expandedGroups[file]}
                                  onToggle={() => toggleGroup(file)}
                                  onRemove={activeTab === 'current' ? onRoadGroupRemove : undefined}
                                  isRemovable={activeTab === 'current'}
                                  isHidden={hiddenGroups[file]}
                                  onToggleVisibility={(e) => handleToggleGroupVisibility(file, e)}
                                />
                              ));
                            })()
                          ) : (
                            <div className="empty-day-message">
                              Нет маршрутов для этого дня
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Сообщение, если данных нет вообще */}
          {sortedDays.length === 0 && (
            <div className="empty-tab-message">
              Нет данных для отображения в "{activeTab === 'current' ? 'Текущие' : 'Архив'}".
            </div>
          )}
        </div>

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
  onPointSelect,
  isRemovable = true,
  isHidden = false,
  onToggleVisibility
}) => {
  const contentRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const groupName = group.replace(/\.(json|geojson)$/, '');
  const isLargeGroup = items.length > 5;

  useEffect(() => {
    if (contentRef.current && isExpanded) {
      const hasScrollbar = contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setIsScrollable(hasScrollbar);
    } else {
      setIsScrollable(false);
    }
  }, [isExpanded, items.length]);

  return (
    <div className={`group-item ${isLargeGroup ? 'large-group' : ''} ${isHidden ? 'hidden' : ''}`}>
      <div
        className={`group-header ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
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
        
        <div className="group-controls">
          <button
            className={`visibility-btn ${isHidden ? 'hidden' : ''}`}
            onClick={onToggleVisibility}
            title={isHidden ? "Показать группу" : "Скрыть группу"}
            type="button"
          >
            {isHidden ? <FaEyeSlash /> : <FaEye />}
          </button>
          
          <FaChevronRight className="group-expand-icon" />
          
          {isRemovable && (
            <button
              className="remove-group-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onRemove) onRemove(group);
              }}
              title={`Удалить группу ${groupName}`}
              type="button"
            >
              <FaMinus />
            </button>
          )}
        </div>
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
          role="button"
          tabIndex="0"
          onKeyDown={(e) => e.key === 'Enter' && onPointSelect(point.id)}
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