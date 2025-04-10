import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { getStateDemographics } from '../api'; // Import the API function
import Sidebar from './Sidebar'; // Import Sidebar component

// Set Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
    const [stateName, setStateName] = useState("");
    const [stateData, setStateData] = useState(null);
    const [selectedBoundaryType, setSelectedBoundaryType] = useState('states');
    const [radius, setRadius] = useState(20000); // in meters
    const [nearbyPlaces, setNearbyPlaces] = useState([]);

    // Use ref to store map instance so it can be accessed in multiple hooks.
    const mapRef = useRef(null);

    // Function to create a GeoJSON circle
    function createGeoJSONCircle(center, radiusInKm, points = 64) {
        const coords = {
            latitude: center[1],
            longitude: center[0]
        };

        const km = radiusInKm;
        const ret = [];
        const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
        const distanceY = km / 110.574;

        for (let i = 0; i < points; i++) {
            const theta = (i / points) * (2 * Math.PI);
            const x = distanceX * Math.cos(theta);
            const y = distanceY * Math.sin(theta);
            ret.push([coords.longitude + x, coords.latitude + y]);
        }
        ret.push(ret[0]);

        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [ret]
            }
        };
    }

    // Effect for adding markers when nearbyPlaces change.
    useEffect(() => {
        if (!nearbyPlaces.length || !mapRef.current) return;

        const map = mapRef.current;
        // Save marker references so they can be removed later.
        const markers = [];

        nearbyPlaces.forEach(place => {
            console.log(place)
            // const marker = new mapboxgl.Marker({ color: "#ff6600" })
            //     .setLngLat([place.lng, place.lat])
            //     .setPopup(
            //         new mapboxgl.Popup().setText(`${place.name} (${place.distance.toFixed(2)} km)`)
            //     )
            //     .addTo(map);
            const markerEl = document.createElement('div');
            markerEl.className = 'custom-marker';

            const labelEl = document.createElement('div');
            labelEl.className = 'marker-label';
            labelEl.innerText = place.name;

            markerEl.appendChild(labelEl);

            const marker = new mapboxgl.Marker(markerEl)
                .setLngLat([place.lng, place.lat])
                .addTo(map);
            markers.push(marker);
        });

        // Cleanup markers on unmount or when nearbyPlaces changes.
        return () => markers.forEach(m => m.remove());
    }, [nearbyPlaces]);

    // Main map initialization effect.
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-99.73, 43.41],
            zoom: 3,
            projection: 'globe',
            antialias: true,
        });
        // Store map instance in ref.
        mapRef.current = map;

        const loadGeoJSONData = async (type) => {
            const filePath = `geo_data/${type}.geo.json`;

            try {
                const response = await fetch(filePath);
                const data = await response.json();

                // Remove old layers and source if already added.
                if (map.getSource('boundaries')) {
                    if (map.getLayer('state-boundaries')) map.removeLayer('state-boundaries');
                    if (map.getLayer('state-borders')) map.removeLayer('state-borders');
                    if (map.getSource('boundaries')) map.removeSource('boundaries');
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
                    const name = feature.properties.NAME;
                    const coordinates = e.lngLat;
                    console.log(coordinates);

                    // Load demographics only if we're viewing states
                    if (selectedBoundaryType === 'states' && feature.properties.GEOID) {
                        const data = await getStateDemographics(feature.properties.GEOID);
                        if (data) setStateData(data);
                    }

                    // Highlight the clicked state by changing the fill color temporarily.
                    if (feature.properties.GEOID) {
                        map.setPaintProperty('state-boundaries', 'fill-color', [
                            'case',
                            ['==', ['get', 'GEOID'], feature.properties.GEOID],
                            '#ff0800', // Red for the clicked state
                            '#888888'  // Default color for other states
                        ]);
                    }

                    // Fetch nearby places on click.
                    try {
                        const res = await fetch(
                            `http://localhost:5001/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}&page=1&limit=10`
                        );
                        const nearby = await res.json();
                        setNearbyPlaces(nearby.nearby || []);
                    } catch (err) {
                        console.error('Error fetching nearby places:', err);
                    }

                    // Remove existing radius circle if present.
                    if (map.getSource('radius-circle')) {
                        if (map.getLayer('radius-circle')) map.removeLayer('radius-circle');
                        map.removeSource('radius-circle');
                    }

                    // Add circle showing the radius.
                    const circle = createGeoJSONCircle([coordinates.lng, coordinates.lat], radius / 1000); // converting meters to kilometers
                    map.addSource('radius-circle', {
                        type: 'geojson',
                        data: circle
                    });
                    map.addLayer({
                        id: 'radius-circle',
                        type: 'fill',
                        source: 'radius-circle',
                        paint: {
                            'fill-color': '#414ee4',
                            'fill-opacity': 0.2
                        }
                    });

                    // Reset the fill color after a brief timeout.
                    setTimeout(() => {
                        map.setPaintProperty('state-boundaries', 'fill-color', '#888888');
                    }, 300);
                });

            } catch (error) {
                console.error('Error loading GeoJSON data:', error);
            }
        };

        loadGeoJSONData(selectedBoundaryType);

        // Clean up on component unmount
        return () => {
            map.remove();
        };
    }, [selectedBoundaryType]); // Dependency reloads when boundary type changes

    return (
        <>
            <div className="radius-selector">
                <label>Search Radius (meters)</label>
                <input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    min={100}
                    step={1000}
                />
            </div>

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
