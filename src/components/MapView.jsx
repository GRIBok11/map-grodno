import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ mapRef }) {
  useEffect(() => {
      const mapContainerRef = useRef(null);
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [53.6841, 23.8341],
      zoom: 9,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;
  }, []);

 return null;
}
