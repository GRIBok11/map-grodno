import React from 'react';

const RouteList = ({ routes, visible }) => {
  if (!visible) return null;
  
  return (
    <div className="panel-section">
      <div className="section-title">Построенные маршруты</div>
      <div id="routeList">
        {routes.length === 0 ? (
          <div className="placeholder-text">Маршруты появятся здесь после построения</div>
        ) : (
          routes.map(route => (
            <div 
              key={route.id} 
              className="route-entry"
              style={{borderLeftColor: route.color}}
            >
              <b style={{color: route.color}}>{route.name}</b>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RouteList;