import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Make sure you replace 'YOUR_MAPBOX_API_KEY' with your actual Mapbox Access Token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
    useEffect(() => {
        // Create the map instance when the component is mounted
        const map = new mapboxgl.Map({
            container: 'map', // The ID of the container element
            style: 'mapbox://styles/mapbox/streets-v11', // Map style
            center: [-99.73, 43.41], // Center the map at coordinates (longitude, latitude)
            zoom: 3, // Set zoom level
            projection: 'globe', // Set map projection to globe for Earth-like view
            antialias: true, // Helps with smoother rendering on the globe
        });

        // Fetch GeoJSON data from the local file (adjust the path if necessary)
        fetch('geo_data/us/2010/state.geo.json')
            .then(response => response.json())
            .then(data => {
                // Add GeoJSON data as a map source
                map.addSource('us-states', {
                    type: 'geojson',
                    data: data
                });

                // Add a layer to display the boundaries of US states
                map.addLayer({
                    id: 'state-boundaries',
                    type: 'fill',
                    source: 'us-states',
                    paint: {
                        'fill-color': '#888888', // Color for the state boundaries
                        'fill-opacity': 0.5 // Transparency of the fill color
                    }
                });

                // Add a border to the state boundaries
                map.addLayer({
                    id: 'state-borders',
                    type: 'line',
                    source: 'us-states',
                    paint: {
                        'line-color': '#000000', // Border color
                        'line-width': 2 // Border width
                    }
                });

                // Create a popup (tooltip) that will be used to show properties
                const popup = new mapboxgl.Popup({
                    closeButton: false, // No close button on the popup
                    closeOnClick: false // Keep the popup open when clicking on the map
                });

                // Show properties on hover (mouseenter event)
                map.on('mouseenter', 'state-boundaries', (e) => {
                    // Get the first feature (state) under the mouse
                    const feature = e.features[0];
                    const properties = feature.properties;

                    // Create the popup HTML content
                    const popupContent = `
                        <h3>${properties.NAME}</h3>
                        <p><strong>State Code:</strong> ${properties.STUSPS}</p>
                        <p><strong>GEOID:</strong> ${properties.GEOID}</p>
                        <p><strong>Land Area (sq meters):</strong> ${properties.ALAND}</p>
                        <p><strong>Water Area (sq meters):</strong> ${properties.AWATER}</p>
                    `;

                    // Set popup content and position it at the mouse location
                    popup.setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(map);
                });

                // Hide the popup when the mouse leaves the state (mouseleave event)
                map.on('mouseleave', 'state-boundaries', () => {
                    popup.remove(); // Remove the popup when the mouse leaves the state
                });

                map.on('mouseenter', 'state-boundaries', (e) => {
                    map.getCanvas().style.cursor = 'pointer';
                    // Get the first feature (state) under the mouse
                    const feature = e.features[0];

                    // Get the name of the state (NAME10 property)
                    const stateName = feature.properties.NAME10;
                    console.log(stateName);
                });

                // Reset the cursor when leaving the state boundaries
                map.on('mouseleave', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = '';
                });
            })
            .catch(error => {
                console.error('Error loading GeoJSON data:', error);
            });

        // Cleanup function to remove the map when the component is unmounted
        return () => {
            map.remove();
        };
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    return (
        <div>
            {/* Container for the map */}
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>
        </div>
    );
};

export default MapComponent;
