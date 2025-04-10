import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { getStateDemographics } from '../api';
import Sidebar from './Sidebar';
import { createGeoJSONCircle } from '../utils/createGeoJSONCircle';

// Set Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const colorPalette = [
    '#00008B', '#0000CD', '#4169E1', '#4682B4', '#5F9EA0',
    '#87CEEB', '#4682B4', '#00BFFF', '#1E90FF', '#ADD8E6'
];

const MapComponent = () => {
    const [stateName, setStateName] = useState('');
    const [stateData, setStateData] = useState(null);
    const [selectedBoundaryType, setSelectedBoundaryType] = useState('states');
    const [radius, setRadius] = useState(30000); // in meters
    const [nearbyPlaces, setNearbyPlaces] = useState([]);

    const mapRef = useRef(null);
    const previousLayerIds = useRef([]);
    const circleLayerAdded = useRef(false);
    const markerRef = useRef([]);

    // Nearby places marker and boundaries update
    useEffect(() => {
        if (!nearbyPlaces.length || !mapRef.current) return;
        const map = mapRef.current;
        const markers = [];

        // Remove existing boundary layers and sources
        previousLayerIds.current.forEach(layerId => {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(layerId)) map.removeSource(layerId);
        });
        previousLayerIds.current = [];

        // Add new places and layers
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

                map.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: place.geojson,
                        properties: {}
                    }
                });

                map.addLayer({
                    id: fillLayerId,
                    type: 'fill',
                    source: sourceId,
                    paint: {
                        'fill-color': fillColor,
                        'fill-opacity': 0.4
                    }
                });

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

        return () => {
            markers.forEach(m => m.remove());
            previousLayerIds.current.forEach(layerId => {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(layerId)) map.removeSource(layerId);
            });
            previousLayerIds.current = [];
        };
    }, [nearbyPlaces]);

    // Main map logic
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
        let cancelled = false;

        const loadGeoJSONData = async (type) => {
            const filePath = `geo_data/${type}.geo.json`;

            try {
                const response = await fetch(filePath);
                const data = await response.json();

                if (map.getSource('boundaries')) {
                    if (map.getLayer('state-boundaries')) map.removeLayer('state-boundaries');
                    if (map.getLayer('state-borders')) map.removeLayer('state-borders');
                    map.removeSource('boundaries');
                }

                map.addSource('boundaries', { type: 'geojson', data });

                map.addLayer({
                    id: 'state-boundaries',
                    type: 'fill',
                    source: 'boundaries',
                    paint: {
                        'fill-color': '#888888',
                        'fill-opacity': 0.1
                    }
                });

                map.addLayer({
                    id: 'state-borders',
                    type: 'line',
                    source: 'boundaries',
                    paint: {
                        'line-color': '#000',
                        'line-width': 0.5
                    }
                });

                let currentStateName = '';

                map.on('mousemove', 'state-boundaries', (e) => {
                    if (cancelled) return;
                    const name = e.features?.[0]?.properties?.NAME;
                    if (name && name !== currentStateName) {
                        currentStateName = name;
                        setStateName(name);
                    }
                });

                map.on('mouseenter', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'state-boundaries', () => {
                    map.getCanvas().style.cursor = '';
                    setStateName('');
                });

                map.on('click', 'state-boundaries', async (e) => {
                    const coordinates = e.lngLat;

                    markerRef.current.forEach(m => m.remove());
                    markerRef.current = [];

                    const newMarker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
                    markerRef.current.push(newMarker);

                    try {
                        const demogData = await getStateDemographics(coordinates.lat, coordinates.lng);
                        if (!cancelled && demogData) setStateData(demogData);
                    } catch (error) {
                        console.error('Error fetching demographics:', error);
                    }

                    try {
                        const res = await fetch(
                            `http://localhost:5001/nearby-redis?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}&page=1&limit=30`
                        );
                        const data = await res.json();
                        if (!cancelled) setNearbyPlaces(data.nearby || []);
                    } catch (error) {
                        console.error('Error fetching nearby places:', error);
                    }

                    if (map.getSource('radius-circle')) {
                        if (map.getLayer('radius-circle')) map.removeLayer('radius-circle');
                        map.removeSource('radius-circle');
                    }

                    const circle = createGeoJSONCircle([coordinates.lng, coordinates.lat], radius / 1000);
                    map.addSource('radius-circle', { type: 'geojson', data: circle });
                    map.addLayer({
                        id: 'radius-circle',
                        type: 'fill',
                        source: 'radius-circle',
                        paint: { 'fill-color': '#414ee4', 'fill-opacity': 0.2 }
                    });

                    circleLayerAdded.current = true;
                });
            } catch (err) {
                console.error('Error loading GeoJSON data:', err);
            }
        };

        loadGeoJSONData(selectedBoundaryType);

        const handleClickOutside = (e) => {
            const mapEl = document.getElementById('map');
            if (!mapEl.contains(e.target)) {
                setNearbyPlaces([]);
                if (circleLayerAdded.current) {
                    if (map.getLayer('radius-circle')) map.removeLayer('radius-circle');
                    if (map.getSource('radius-circle')) map.removeSource('radius-circle');
                    circleLayerAdded.current = false;
                }
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            cancelled = true;
            document.removeEventListener('click', handleClickOutside);
            map.remove();
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
