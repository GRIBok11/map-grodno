export const ROUTE_COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", 
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"
];

export const GROUP_COLORS = {
  "monday.json": "#e6194b",
  "points2.json": "#3cb44b",
};

export const DISTRICT_STYLE = {
  color: "blue",
  weight: 2,
  fillColor: "lightblue",
  fillOpacity: 0.2,
};

export const MAP_CONFIG = {
  center: [53.9, 27.56],
  zoom: 12,
  tileLayer: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};