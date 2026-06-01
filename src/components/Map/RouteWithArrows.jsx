// RouteWithArrows.jsx

import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { useEffect } from 'react';

function RouteWithArrows({ positions, color = 'blue' }) {
    const map = useMap();

    useEffect(() => {
        if (!positions || positions.length < 2) return;

        const polyline = L.polyline(positions, {
            color,
            weight: 4
        }).addTo(map);

        const decorator = L.polylineDecorator(polyline, {
            patterns: [
                {
                    offset: 25,
                    repeat: 50,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        polygon: true,
                        pathOptions: {
                            color,
                            fillOpacity: 1,
                            weight: 2
                        }
                    })
                }
            ]
        });

        decorator.addTo(map);

        return () => {
            map.removeLayer(polyline);
            map.removeLayer(decorator);
        };
    }, [map, positions, color]);

    return null;
}

export default RouteWithArrows;