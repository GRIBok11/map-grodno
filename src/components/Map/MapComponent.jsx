import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { MAP_CONFIG, DISTRICT_STYLE } from '../../utils/constants';
import MapController from './MapController';
import '/src/styles/maps.css';

const MapComponent = ({ 
  children, 
  districts, 
  onMapInit,
  showDistricts = true 
}) => {
  return (
    <div className="map-container">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController onMapInit={onMapInit} />
        <TileLayer
          url={MAP_CONFIG.tileLayer.url}
          attribution={MAP_CONFIG.tileLayer.attribution}
        />
        
        {/* Отображение границ районов */}
        {showDistricts && districts && (
          <GeoJSON 
            data={districts} 
            style={DISTRICT_STYLE}
          />
        )}
        
        {children}
      </MapContainer>
    </div>
  );
};

export default MapComponent;