export const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

export const filterPoints = (points, query) => {
  if (!query) return points;
  
  const lowerQuery = query.toLowerCase();
  return points.filter(point => 
    point.name.toLowerCase().includes(lowerQuery) ||
    point.address.toLowerCase().includes(lowerQuery)
  );
};

export const calculateIntermediatePoints = (point1, point2) => {
  return [
    [point1.lat, point1.lon],
    [point1.lat + (point2.lat - point1.lat) * 0.3, point1.lon + (point2.lon - point1.lon) * 0.3],
    [point1.lat + (point2.lat - point1.lat) * 0.7, point1.lon + (point2.lon - point1.lon) * 0.7],
    [point2.lat, point2.lon]
  ];
};