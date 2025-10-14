import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const MapController = ({ onMapInit }) => {
  const map = useMap();

  useEffect(() => {
    if (onMapInit) {
      onMapInit(map);
    }
  }, [map, onMapInit]);

  return null;
};

export default MapController;