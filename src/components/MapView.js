import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import '../css/MapView.css';
import 'mapbox-gl-css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapView = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [selectedRegion, setSelectedRegion] = useState(null);

    useEffect(() => {
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-98.5795, 39.8283], // Center of US
            zoom: 2,
        });

        map.current.on('load', () => {
            map.current.addSource('boundaries', {
                type: 'geojson',
                data: 'geo_data/us/2022/state.json',
            });

            map.current.addLayer({
                id: 'boundary-layer',
                type: 'fill',
                source: 'boundaries',
                paint: {
                    'fill-color': '#888888',
                    'fill-opacity': 0.5,
                },
            });

            map.current.on('click', 'boundary-layer', (e) => {
                const props = e.features[0].properties;
                setSelectedRegion(props);
            });

            map.current.on('mouseenter', 'boundary-layer', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'boundary-layer', () => {
                map.current.getCanvas().style.cursor = '';
            });
        });
    }, []);

    return (
        <div>
            <div ref={mapContainer} className="map-container" />
            {selectedRegion && (
                <div className="info-panel">
                    <h4>{selectedRegion.name}</h4>
                    <p>Population: {selectedRegion.population}</p>
                    {/* Add more fields as needed */}
                </div>
            )}
        </div>
    );
};

export default MapView;
