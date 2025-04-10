import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getStateDemographics } from '../api'; // Import the API function
import Sidebar from './Sidebar'; // Import Sidebar component

// Set Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
    const [stateName, setStateName] = useState(""); // Store selected state name
    const [stateData, setStateData] = useState(null); // Store fetched state data

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-99.73, 43.41],
            zoom: 3,
            projection: 'globe', // Enable globe view
            antialias: true, // Enable antialiasing for smoother rendering
        });

        const loadGeoJSONData = async () => {
            try {
                const response = await fetch('geo_data/us/places/cb_2023_us_place_500k.geo.json');
                const data = await response.json();

                map.addSource('us-states', {
                    type: 'geojson',
                    data,
                });

                map.addLayer({
                    id: 'state-boundaries',
                    type: 'fill',
                    source: 'us-states',
                    paint: {
                        'fill-color': '#888888',
                        'fill-opacity': 0.1,
                    },
                });

                map.addLayer({
                    id: 'state-borders',
                    type: 'line',
                    source: 'us-states',
                    paint: {
                        'line-color': '#000000',
                        'line-width': 0.5,
                    },
                });

                let currentStateName = "";
                map.on('mousemove', 'state-boundaries', (e) => {
                    const features = e.features;
                    if (!features.length) return;

                    const state = features[0].properties.NAME;
                    if (state !== currentStateName) {
                        currentStateName = state;
                        setStateName(state);
                    }
                });

                // Set cursor to pointer on hover
                map.on('mouseenter', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Reset cursor when mouse leaves
                map.on('mouseleave', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = '';
                    setStateName("");
                    currentStateName = "";
                });

                map.on('click', 'state-boundaries', async (e) => {
                    const feature = e.features[0];
                    const geoid = feature.properties.GEOID;

                    console.log(`${geoid} was clicked!`);

                    // Fetch demographic data for the clicked state
                    const data = await getStateDemographics(geoid);
                    if (data) setStateData(data);

                    // Highlight the clicked state
                    map.setPaintProperty('state-boundaries', 'fill-color', [
                        'case',
                        ['==', ['get', 'GEOID'], geoid],
                        '#ff0800',
                        '#888888',
                    ]);

                    setTimeout(() => {
                        // Reset state colors and filters
                        map.setFilter('state-boundaries', ['!=', ['get', 'GEOID'], '']);
                        map.setPaintProperty('state-boundaries', 'fill-color', '#888888');
                    }, 300);
                });

            } catch (error) {
                console.error('Error loading GeoJSON data:', error);
            }
        };

        loadGeoJSONData();

        return () => {
            map.remove();
        };
    }, []);

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>
            <Sidebar stateName={stateName} stateData={stateData} />
        </div>
    );
};

export default MapComponent;
