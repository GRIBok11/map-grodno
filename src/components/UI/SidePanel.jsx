import React from 'react';
import PointList from './PointList';
import RouteList from '../RouteList';
import '/src/styles/App.css';


const SidePanel = ({ 
  isOpen, 
  points, 
  selectedPoints, 
  onPointSelect, 
  routes, 
  showPoints, 
  showRoutes 
}) => {
  if (!isOpen) return null;

  return (
    <div className="side-panel open">
      <div className="side-panel-content">
        <PointList 
          points={points}
          selectedPoints={selectedPoints}
          onPointSelect={onPointSelect}
          visible={showPoints}
        />
        
        <RouteList 
          routes={routes}
          visible={showRoutes}
        />
      </div>
    </div>
  );
};

export default SidePanel;