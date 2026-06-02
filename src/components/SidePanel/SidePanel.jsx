import React, { useState, useRef, useEffect } from 'react';
import './SidePanel.css';
import { FaTimes, FaMapMarkerAlt, FaRoute, FaRoad, FaMinus, FaChevronRight, FaChevronDown, FaCalendarAlt, FaEye, FaEyeSlash, FaCar, FaSignal, FaClock, FaExclamationTriangle, FaWifi } from 'react-icons/fa';

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

// 🔹 Тестовые данные для динамических объектов (машин)
const TEST_VEHICLES = [
  { id: 1, name: "МАЗ-5550", plate: "АВ 1234-7", driver: "Иванов И.И.", status: "on_schedule", delay: 0, lastUpdate: "2024-01-15 14:30:25", route: "Маршрут №1", connection: "online" },
  { id: 2, name: "МАЗ-6312", plate: "АС 5678-7", driver: "Петров П.П.", status: "delayed", delay: 15, lastUpdate: "2024-01-15 14:28:12", route: "Маршрут №2", connection: "online" },
  { id: 3, name: "Volvo FH", plate: "ВЕ 9012-7", driver: "Сидоров С.С.", status: "lost_connection", delay: 0, lastUpdate: "2024-01-15 13:15:45", route: "Маршрут №3", connection: "offline" },
  { id: 4, name: "Scania R450", plate: "ВР 3456-7", driver: "Кузнецов К.К.", status: "on_schedule", delay: 0, lastUpdate: "2024-01-15 14:32:18", route: "Маршрут №1", connection: "online" },
  { id: 5, name: "MAN TGX", plate: "ВХ 7890-7", driver: "Михайлов М.М.", status: "delayed", delay: 8, lastUpdate: "2024-01-15 14:29:55", route: "Маршрут №2", connection: "online" },
];

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
  onPointSelect,
  onToggleDayVisibility,
  onToggleGroupVisibility,
  hiddenDays = {},
  hiddenGroups = {},
  // 🔹 НОВЫЕ ПРОПСЫ ДЛЯ ДИНАМИЧЕСКИХ ОБЪЕКТОВ
  showDynamicObjects = true,
  vehicles = TEST_VEHICLES // Можно передавать из родительского компонента
}) => {
  const [expandedSections, setExpandedSections] = useState({
    points: true,
    routes: true,
    vehicles: true // Добавляем секцию с машинами
  });
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('current'); // 'current' или 'archive'
  const [vehicleFilter, setVehicleFilter] = useState('all'); // 'all', 'on_schedule', 'delayed', 'lost_connection'

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

  const handleToggleDayVisibility = (day, e) => {
    e.stopPropagation();
    if (onToggleDayVisibility) {
      onToggleDayVisibility(day);
    }
  };

  const handleToggleGroupVisibility = (group, e) => {
    e.stopPropagation();
    if (onToggleGroupVisibility) {
      onToggleGroupVisibility(group);
    }
  };

  // Фильтрация автомобилей
  const getFilteredVehicles = () => {
    if (vehicleFilter === 'all') return vehicles;
    return vehicles.filter(v => v.status === vehicleFilter);
  };

  // Получение статуса автомобиля
  const getVehicleStatusInfo = (status) => {
    switch(status) {
      case 'on_schedule':
        return { icon: <FaClock />, text: 'По расписанию', color: '#22c55e', bgColor: '#dcfce7' };
      case 'delayed':
        return { icon: <FaExclamationTriangle />, text: 'Опаздывает', color: '#eab308', bgColor: '#fef9c3' };
      case 'lost_connection':
        return { icon: <FaWifi />, text: 'Потеряна связь', color: '#ef4444', bgColor: '#fee2e2' };
      default:
        return { icon: <FaCar />, text: 'Неизвестно', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  // Форматирование задержки
  const formatDelay = (minutes) => {
    if (minutes === 0) return 'без опоздания';
    return `опоздание ${minutes} мин`;
  };

  const getDayFromFileName = (fileName) => {
    const lowerName = fileName.toLowerCase();
    for (const [dayKey, dayName] of Object.entries(WEEK_DAYS)) {
      if (lowerName.includes(dayKey)) {
        return dayName;
      }
    }
    return "Другое";
  };

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

  const displayPointsGroupedByDay = activeTab === 'current' ? currentPointsGroupedByDay : archivePointsGroupedByDay;
  const displayRoutesGroupedByDay = activeTab === 'current' ? currentRoutesGroupedByDay : archiveRoutesGroupedByDay;

  const getAllDaysWithData = () => {
    const allPossibleDays = [...Object.values(WEEK_DAYS), "Другое"];
    const daysFromPoints = Object.keys(displayPointsGroupedByDay);
    const daysFromRoutes = Object.keys(displayRoutesGroupedByDay);
    const allDaysWithData = [...new Set([...daysFromPoints, ...daysFromRoutes])];
    const allDays = [...new Set([...allPossibleDays, ...allDaysWithData])];
    return allDays;
  };

  const sortDays = (days) => {
    const dayOrder = Object.values(WEEK_DAYS);
    return days.sort((a, b) => {
      const indexA = dayOrder.indexOf(a);
      const indexB = dayOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  const allDays = getAllDaysWithData();
  const sortedDays = sortDays(allDays);

  const hasDataForDay = (day) => {
    const hasPoints = displayPointsGroupedByDay[day] && displayPointsGroupedByDay[day].length > 0;
    const hasRoutes = displayRoutesGroupedByDay[day] && displayRoutesGroupedByDay[day].length > 0;
    return hasPoints || hasRoutes;
  };

  const getAllGroupsInDay = (day) => {
    const pointGroups = displayPointsGroupedByDay[day] 
      ? [...new Set(displayPointsGroupedByDay[day].map(point => point.group))]
      : [];
    const routeGroups = displayRoutesGroupedByDay[day] 
      ? [...new Set(displayRoutesGroupedByDay[day].map(route => route.group))]
      : [];
    return [...new Set([...pointGroups, ...routeGroups])];
  };

  const isDayFullyHidden = (day) => {
    const groups = getAllGroupsInDay(day);
    if (groups.length === 0) return false;
    return groups.every(group => hiddenGroups[group]);
  };

  // Статистика по автомобилям
  const getVehicleStats = () => {
    const total = vehicles.length;
    const onSchedule = vehicles.filter(v => v.status === 'on_schedule').length;
    const delayed = vehicles.filter(v => v.status === 'delayed').length;
    const lostConnection = vehicles.filter(v => v.status === 'lost_connection').length;
    return { total, onSchedule, delayed, lostConnection };
  };

  const stats = getVehicleStats();

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

        {/* 🔹 Секция динамических объектов (машин) */}
        {showDynamicObjects && (
          <div className="dynamic-objects-section">
            <div
              className={`section-header ${expandedSections.vehicles ? 'expanded' : ''}`}
              onClick={() => toggleSection('vehicles')}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => e.key === 'Enter' && toggleSection('vehicles')}
            >
              <FaCar className="section-icon" />
              <h3>Динамические объекты</h3>
              <span className="section-badge">{stats.total}</span>
              <FaChevronDown className="expand-icon" />
            </div>
            
            {expandedSections.vehicles && (
              <div className="vehicles-content">
                {/* Фильтры */}
                <div className="vehicle-filters">
                  <button 
                    className={`filter-chip ${vehicleFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setVehicleFilter('all')}
                  >
                    Все ({stats.total})
                  </button>
                  <button 
                    className={`filter-chip schedule ${vehicleFilter === 'on_schedule' ? 'active' : ''}`}
                    onClick={() => setVehicleFilter('on_schedule')}
                  >
                    По расписанию ({stats.onSchedule})
                  </button>
                  <button 
                    className={`filter-chip delayed ${vehicleFilter === 'delayed' ? 'active' : ''}`}
                    onClick={() => setVehicleFilter('delayed')}
                  >
                    Опаздывают ({stats.delayed})
                  </button>
                  <button 
                    className={`filter-chip lost ${vehicleFilter === 'lost_connection' ? 'active' : ''}`}
                    onClick={() => setVehicleFilter('lost_connection')}
                  >
                    Потеря связи ({stats.lostConnection})
                  </button>
                </div>

                {/* Список автомобилей */}
                <div className="vehicles-list">
                  {getFilteredVehicles().map(vehicle => {
                    const statusInfo = getVehicleStatusInfo(vehicle.status);
                    return (
                      <div key={vehicle.id} className="vehicle-card">
                        <div className="vehicle-header">
                          <div className="vehicle-icon" style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}>
                            {statusInfo.icon}
                          </div>
                          <div className="vehicle-info">
                            <div className="vehicle-name">{vehicle.name}</div>
                            <div className="vehicle-plate">{vehicle.plate}</div>
                          </div>
                          <div className={`vehicle-status ${vehicle.status}`}>
                            {statusInfo.text}
                          </div>
                        </div>
                        
                        <div className="vehicle-details">
                          <div className="detail-row">
                            <span className="detail-label">Водитель:</span>
                            <span className="detail-value">{vehicle.driver}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Маршрут:</span>
                            <span className="detail-value">{vehicle.route}</span>
                          </div>
                          {vehicle.status === 'delayed' && (
                            <div className="detail-row delay-info">
                              <span className="detail-label">⏰ Задержка:</span>
                              <span className="detail-value delay-value">{formatDelay(vehicle.delay)}</span>
                            </div>
                          )}
                          <div className="detail-row">
                            <span className="detail-label">Последнее обновление:</span>
                            <span className="detail-value">{vehicle.lastUpdate}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Связь:</span>
                            <span className={`connection-status ${vehicle.connection}`}>
                              {vehicle.connection === 'online' ? '🟢 Онлайн' : '🔴 Оффлайн'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {getFilteredVehicles().length === 0 && (
                    <div className="empty-vehicles-message">
                      Нет автомобилей с выбранным статусом
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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