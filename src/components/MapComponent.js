import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getStateDemographics } from '../api'; // Import the API function
import Sidebar from './Sidebar'; // Import Sidebar component

// Make sure you replace 'YOUR_MAPBOX_API_KEY' with your actual Mapbox Access Token
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

        fetch('geo_data/us/2010/state.geo.json')
            .then((response) => response.json())
            .then((data) => {
                map.addSource('us-states', {
                    type: 'geojson',
                    data: data,
                });

                map.addLayer({
                    id: 'state-boundaries',
                    type: 'fill',
                    source: 'us-states',
                    paint: {
                        'fill-color': '#888888',
                        'fill-opacity': 0.5
                    }
                });

                map.addLayer({
                    id: 'state-borders',
                    type: 'line',
                    source: 'us-states',
                    paint: {
                        'line-color': '#000000',
                        'line-width': 2
                    }
                });

                let currentStateName = "";

                map.on('mousemove', 'state-boundaries', (e) => {
                    const features = e.features;
                    if (!features.length) return;

                    const feature = features[0];
                    const state = feature.properties.NAME10;

                    // Only update if the state has changed
                    if (state !== currentStateName) {
                        currentStateName = state;
                        setStateName(state); // Update the selected state name
                    }
                });

                // Change cursor to 'pointer' when hovering over the state boundaries
                map.on('mouseenter', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = 'pointer'; // Set the cursor to 'pointer' (hand)
                });

                // Reset cursor when mouse leaves the state boundaries
                map.on('mouseleave', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = '';
                    setStateName(""); // Clear the state name when mouse leaves
                    currentStateName = "";
                });

                // Add click event for highlighting and logging state name
                map.on('click', 'state-boundaries', async (e) => {
                    const feature = e.features[0]; // Get the feature clicked
                    const state = feature.properties.NAME10;
                    console.log(`${state} was clicked!`);

                    // Fetch demographic data for the clicked state
                    const data = await getStateDemographics(state);

                    if (data) {
                        setStateData(data); // Update the state data for the sidebar
                    }

                    // Highlight the clicked state for a brief moment
                    map.setPaintProperty('state-boundaries', 'fill-color', [
                        'case',
                        ['==', ['get', 'NAME10'], state], // If the clicked state is this one
                        '#ff0800', // Set clicked state to red
                        '#888888', // Set other states to default color
                    ]);

                    // Set a timeout to reset the fill color after 1 second
                    setTimeout(() => {
                        map.setPaintProperty('state-boundaries', 'fill-color', '#888888'); // Reset to default color
                    }, 300);
                });
            })
            .catch((error) => {
                console.error('Error loading GeoJSON data:', error);
            });

        return () => {
            map.remove();
        };
    }, []);

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>
            <Sidebar stateName={stateName} stateData={stateData} /> {/* Pass stateName and stateData to Sidebar */}
        </div>
    );
};

export default MapComponent;
