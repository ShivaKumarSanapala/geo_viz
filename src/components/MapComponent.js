import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getStateDemographics } from '../api'; // Import the API function
import Sidebar from './Sidebar'; // Import Sidebar component

// Set Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
    const [stateName, setStateName] = useState("");
    const [stateData, setStateData] = useState(null);
    const [selectedBoundaryType, setSelectedBoundaryType] = useState('states');

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-99.73, 43.41],
            zoom: 3,
            projection: 'globe',
            antialias: true,
        });

        let currentSource = null;

        const loadGeoJSONData = async (type) => {
            let filePath = `geo_data/${type}.geo.json`;

            try {
                const response = await fetch(filePath);
                const data = await response.json();

                if (map.getSource('boundaries')) {
                    map.removeLayer('state-boundaries');
                    map.removeLayer('state-borders');
                    map.removeSource('boundaries');
                }

                map.addSource('boundaries', {
                    type: 'geojson',
                    data,
                });

                map.addLayer({
                    id: 'state-boundaries',
                    type: 'fill',
                    source: 'boundaries',
                    paint: {
                        'fill-color': '#888888',
                        'fill-opacity': 0.1,
                    },
                });

                map.addLayer({
                    id: 'state-borders',
                    type: 'line',
                    source: 'boundaries',
                    paint: {
                        'line-color': '#000000',
                        'line-width': 0.5,
                    },
                });

                let currentStateName = "";

                map.on('mousemove', 'state-boundaries', (e) => {
                    const features = e.features;
                    if (!features.length) return;

                    const name = features[0].properties.NAME;
                    if (name !== currentStateName) {
                        currentStateName = name;
                        setStateName(name);
                    }
                });

                map.on('mouseenter', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = '';
                    setStateName("");
                });

                map.on('click', 'state-boundaries', async (e) => {
                    const feature = e.features[0];
                    const geoid = feature.properties.GEOID;

                    console.log(`${geoid} was clicked!`);

                    // Load demographics only if we're viewing states
                    if (selectedBoundaryType === 'states') {
                        const data = await getStateDemographics(geoid);
                        if (data) setStateData(data);
                    }

                    // Ensure GEOID is valid before setting the color
                    if (geoid) {
                        map.setPaintProperty('state-boundaries', 'fill-color', [
                            'case',
                            ['==', ['get', 'GEOID'], geoid],
                            '#ff0800', // Red color for the clicked state
                            '#888888', // Default color for other states
                        ]);
                    }

                    setTimeout(() => {
                        // Reset to default color after a brief timeout
                        map.setPaintProperty('state-boundaries', 'fill-color', '#888888');
                    }, 300);
                });

            } catch (error) {
                console.error('Error loading GeoJSON data:', error);
            }
        };

        loadGeoJSONData(selectedBoundaryType);

        return () => {
            map.remove();
        };
    }, [selectedBoundaryType]); // Reload map layer when boundary type changes

    return (
        <>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>
            <Sidebar
                stateName={stateName}
                stateData={stateData}
                selectedBoundaryType={selectedBoundaryType}
                setSelectedBoundaryType={setSelectedBoundaryType}
            />
        </>
    );
};


export default MapComponent;
