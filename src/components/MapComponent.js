import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { getStateDemographics } from '../api';
import Sidebar from './Sidebar';
import { createGeoJSONCircle } from "../utils/createGeoJSONCircle";

// Set Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const colorPalette = [
    '#00008B', '#0000CD', '#4169E1', '#4682B4', '#5F9EA0', '#87CEEB', '#4682B4', '#00BFFF', '#1E90FF', '#ADD8E6'
];

const MapComponent = () => {
    const [stateName, setStateName] = useState("");
    const [stateData, setStateData] = useState(null);
    const [selectedBoundaryType, setSelectedBoundaryType] = useState('states');
    const [radius, setRadius] = useState(20000); // in meters
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const mapRef = useRef(null);
    const previousLayerIds = useRef([]);
    const circleLayerAdded = useRef(false); // To track if the circle layer has been added
    const markerRef = useRef([]); // Store references to markers

    // Effect for adding markers and boundaries when nearbyPlaces change.
    useEffect(() => {
        if (!nearbyPlaces.length || !mapRef.current) return;
        const map = mapRef.current;
        const markers = [];

        // Clean up old layers and sources.
        previousLayerIds.current.forEach(layerId => {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(layerId)) map.removeSource(layerId);
        });
        previousLayerIds.current = [];

        nearbyPlaces.forEach((place, index) => {
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

            if (place.geojson) {
                const sourceId = `nearby-boundary-${index}`;
                const fillLayerId = `nearby-fill-${index}`;
                const lineLayerId = `nearby-line-${index}`;
                const fillColor = colorPalette[index % colorPalette.length];

                // Add GeoJSON source.
                map.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: place.geojson,
                        properties: {}
                    }
                });

                // Fill layer
                map.addLayer({
                    id: fillLayerId,
                    type: 'fill',
                    source: sourceId,
                    paint: {
                        'fill-color': fillColor,
                        'fill-opacity': 0.4
                    }
                });

                // Outline layer.
                map.addLayer({
                    id: lineLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': fillColor,
                        'line-width': 2
                    }
                });

                previousLayerIds.current.push(fillLayerId, lineLayerId, sourceId);
            }
        });

        // Cleanup (undo): remove markers and layers.
        return () => {
            markers.forEach(m => m.remove());
            previousLayerIds.current.forEach(layerId => {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(layerId)) map.removeSource(layerId);
            });
            previousLayerIds.current = [];
        };
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
        mapRef.current = map;

        // A cancellation flag to handle async calls.
        let cancelled = false;

        const loadGeoJSONData = async (type) => {
            const filePath = `geo_data/${type}.geo.json`;

            try {
                const response = await fetch(filePath);
                const data = await response.json();

                // Remove old boundaries.
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
                    if (cancelled) return;
                    const features = e.features;
                    if (!features.length) return;
                    const name = features[0].properties.NAME;
                    if (name !== currentStateName) {
                        currentStateName = name;
                        setStateName(name);
                    }
                });

                map.on('mouseenter', 'state-boundaries', () => {
                    if (cancelled) return;
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'state-boundaries', () => {
                    if (cancelled) return;
                    map.getCanvas().style.cursor = '';
                    setStateName("");
                });

                map.on('click', 'state-boundaries', async (e) => {
                    if (cancelled) return;
                    const feature = e.features[0];
                    const name = feature.properties.NAME;
                    const coordinates = e.lngLat;
                    // Remove old markers before adding a new one
                    markerRef.current.forEach((marker) => {
                        marker.remove();
                    });
                    markerRef.current = []; // Reset the markers list

                    // Create and add a marker at the clicked location
                    const newMarker = new mapboxgl.Marker()
                        .setLngLat(coordinates)
                        .addTo(map);

                    // Store the marker reference
                    markerRef.current.push(newMarker);
                    // Load demographics if applicable.
                    if (selectedBoundaryType === 'states' && feature.properties.GEOID) {
                        try {
                            const data = await getStateDemographics(feature.properties.GEOID);
                            if (!cancelled && data) setStateData(data);
                        } catch (demogError) {
                            console.error('Error fetching demographics:', demogError);
                        }
                    }

                    // Fetch nearby places on click.
                    try {
                        const res = await fetch(
                            `http://localhost:5001/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}&page=1&limit=30`
                        );
                        if (cancelled) return;
                        const nearby = await res.json();
                        if (!cancelled) setNearbyPlaces(nearby.nearby || []);
                    } catch (err) {
                        console.error('Error fetching nearby places:', err);
                    }

                    // Remove any existing radius circle.
                    if (map && map.getSource('radius-circle')) {
                        if (map.getLayer('radius-circle')) map.removeLayer('radius-circle');
                        map.removeSource('radius-circle');
                    }

                    // Add circle to show the search radius.
                    const circle = createGeoJSONCircle([coordinates.lng, coordinates.lat], radius / 1000);
                    if (map) {
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
                        circleLayerAdded.current = true; // Mark that circle has been added
                    }
                });
            } catch (error) {
                console.error('Error loading GeoJSON data:', error);
            }
        };

        loadGeoJSONData(selectedBoundaryType);

        // Handle click outside map to clear nearby places and remove the circle
        const handleClickOutside = (e) => {
            const mapElement = document.getElementById('map');
            if (!mapElement.contains(e.target)) {
                setNearbyPlaces([]); // Clear nearby places when clicking outside
                if (circleLayerAdded.current) {
                    if (map.getSource('radius-circle')) {
                        map.removeLayer('radius-circle');
                        map.removeSource('radius-circle');
                    }
                    circleLayerAdded.current = false; // Reset the flag
                }
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            cancelled = true;
            map.remove();
            document.removeEventListener('click', handleClickOutside);
        };
    }, [selectedBoundaryType]);

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
