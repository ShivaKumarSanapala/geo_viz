import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Sidebar from './Sidebar'; // Import Sidebar component

// Make sure you replace 'YOUR_MAPBOX_API_KEY' with your actual Mapbox Access Token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
    const [stateName, setStateName] = useState(""); // Store the selected state name

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
            .then(response => response.json())
            .then(data => {
                map.addSource('us-states', {
                    type: 'geojson',
                    data: data
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

                const popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                });

                map.on('mouseenter', 'state-boundaries', (e) => {
                    const feature = e.features[0];
                    const properties = feature.properties;
                    const state = properties.NAME10;

                    // Update the stateName in the parent component
                    setStateName(state); // Set the selected state name

                    const popupContent = `
                        <h3>${state}</h3>
                        <p><strong>State Code:</strong> ${properties.STUSPS}</p>
                        <p><strong>GEOID:</strong> ${properties.GEOID}</p>
                        <p><strong>Land Area (sq meters):</strong> ${properties.ALAND}</p>
                        <p><strong>Water Area (sq meters):</strong> ${properties.AWATER}</p>
                    `;
                    popup.setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(map);
                });

                map.on('mouseleave', 'state-boundaries', () => {
                    popup.remove();
                    setStateName(""); // Clear the state name when mouse leaves
                });
            })
            .catch(error => {
                console.error('Error loading GeoJSON data:', error);
            });

        return () => {
            map.remove();
        };
    }, []);

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>
            <Sidebar stateName={stateName} /> {/* Pass stateName to Sidebar */}
        </div>
    );
};

export default MapComponent;
